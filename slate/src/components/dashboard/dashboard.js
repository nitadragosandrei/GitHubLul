import React, { Component } from 'react';
import './dashboard.css';

import apiClient from '../../ApiClient';
import * as utils from '../../utils';

const roles = {
    ADMINISTRATOR: 'ADMINISTRATOR',
    PROJECT_MANAGER: 'PROJECT_MANAGER',
    DEVELOPER: 'DEVELOPER'
}

class Dashboard extends Component {

    constructor(props) {
        super(props);
        this.state = {
            shouldRemoveIcon: true,
            roles: this.props.roles,
            currentUser: this.props.currentUser,
            projectsAssignedToMe: null,
            currentUserTasks: null,
            unassignedTasks: null,
            projectManagerApplications: null
        };
    }

    componentDidMount() {
        window.ts.ui.CompanyCard.connectionTypes = [
            ['TO DO', 'ts-icon-todo'],
            ['In progress', 'ts-icon-drafts'],
            ['In QA', 'ts-icon-view'],
            ['DONE', 'ts-icon-accept']
        ];
        this.reloadDashboard();
    }

    reloadDashboard = () => {
        const self = this;
        apiClient.getProjects().then((projects) => {
            let userTasks = new Array();
            let unassignedTasks = new Array();
            let projectsAssignedToMe = new Array();
            if (projects.length > 0) {
                projects.forEach(element => {
                    if (element.sprints !== undefined && element.sprints.length > 0) {
                        element.sprints.forEach(item => {
                            if (item.tasks !== undefined && item.tasks.length > 0) {
                                item.tasks.forEach(task => {
                                    if (task.assignedTo === this.props.currentUser) {
                                        let elem = {
                                            task: task,
                                            sprint: item.id,
                                            project: element.projectName
                                        }
                                        userTasks.push(elem);
                                    } else if (task.assignedTo === 'unassigned') {
                                        let elem = {
                                            task: task,
                                            sprint: item.id,
                                            project: element.projectName
                                        }
                                        unassignedTasks.push(elem);
                                    }
                                });
                            }
                        });
                    }
                    if (element.projectManager.userId === this.props.currentUser) {
                        projectsAssignedToMe.push(element);
                    }
                });
            }
            if (this.state.roles.includes(roles.PROJECT_MANAGER)) {
                this.setState({ projectsAssignedToMe: projectsAssignedToMe });
            }
            self.setState({
                currentUserTasks: userTasks,
                unassignedTasks: unassignedTasks
            });
            utils.hideBlocker();
        });
        if (this.state.roles.includes(roles.ADMINISTRATOR)) {
            apiClient.getProjectManagerApplications().then(data => {
                utils.hideBlocker();
                this.setState({
                    projectManagerApplications: data
                });
            })
        } else {
            utils.hideBlocker();
        }
    }

    generateTasksAssignedToMe = () => {
        if (this.state.currentUserTasks === null || this.state.currentUserTasks === undefined) {
            return;
        }
        const self = this;
        const tasks = this.state.currentUserTasks;
        var assignedToMeRender = tasks.map(element => {
            let info = {
                "id": element.task.id,
                "data": {
                    "name": element.task.id,
                    "connection": self.mapStatusIcons(element.task.status),
                    "location": element.project + ' - Sprint ' + element.sprint,
                    "industry": element.task.title
                }
            };
            return (
                <div data-ts="CompanyCard" className="task-card" key={element.task.id} onClick={() => {
                    let projectKey = element.task.id.split('-')[0];
                    let task = {
                        displayTask: true,
                        task: element.task,
                        sprint: element.sprint
                    };
                    this.props.jumpToTask(task, projectKey);
                }}>
                    <script type="application/json">
                        {JSON.stringify(info)}
                    </script>
                </div>
            );
        });
        if (assignedToMeRender.length > 0) {
            return assignedToMeRender;
        } else {
            return (
                <div className="tasks-info">
                    <br /> <br />
                    <i className="ts-icon-info"></i>
                    <p>
                        You finished all your work, hurray!
                    </p>
                </div>
            );
        }
    }

    generateOpenTasks = () => {
        if (this.state.unassignedTasks === null || this.state.unassignedTasks === undefined) {
            return;
        }
        const self = this;
        const tasks = this.state.unassignedTasks;
        var openTasks = tasks.map(element => {
            let info = {
                "id": element.task.id,
                "data": {
                    "name": element.task.id,
                    "connection": self.mapStatusIcons(element.task.status),
                    "location": element.project + ' - Sprint ' + element.sprint,
                    "industry": element.task.title
                }
            };
            return (
                <div data-ts="CompanyCard" className="task-card" key={element.task.id} onClick={() => {
                    let projectKey = element.task.id.split('-')[0];
                    let task = {
                        displayTask: true,
                        task: element.task,
                        sprint: element.sprint
                    };
                    this.props.jumpToTask(task, projectKey);
                }}>
                    <script type="application/json">
                        {JSON.stringify(info)}
                    </script>
                </div>
            );
        });
        if (openTasks.length > 0) {
            return openTasks;
        } else {
            return (
                <div className="tasks-info">
                    <br /> <br />
                    <i className="ts-icon-info"></i>
                    <p>
                        No open tasks at the moment. Please check again later
                    </p>
                </div>
            );
        }
    }

    generateProjectsManagedList = () => {
        if (this.state.projectsAssignedToMe === null || this.state.projectsAssignedToMe === undefined) {
            return;
        }

        const self = this;
        const projects = this.state.projectsAssignedToMe;
        var projectsRender = projects.map(item => {
            let numberOfSprints = item.sprints === undefined ? 0 : item.sprints.length;
            let totalTasks = 0;
            let completedTasks = 0;
            let tasksInProgress = 0;
            let tasksInQA = 0;
            if (numberOfSprints > 0) {
                item.sprints.forEach(element => {
                    if (element.tasks !== undefined && element.tasks.length > 0) {
                        element.tasks.forEach(task => {
                            totalTasks += 1;
                            if (task.status === "DONE") {
                                completedTasks += 1;
                            } else if (task.status === "IN PROGRESS") {
                                tasksInProgress += 1;
                            } else if (task.status === "IN QA") {
                                tasksInQA += 1;
                            }
                        });
                    }
                });
            }
            if (item.backlog !== undefined && item.backlog.length > 0) {
                item.backlog.forEach(task => {
                    totalTasks += 1;
                    if (task.status === "DONE") {
                        completedTasks += 1;
                    } else if (task.status === "IN PROGRESS") {
                        tasksInProgress += 1;
                    } else if (task.status === "IN QA") {
                        tasksInQA += 1;
                    }
                });
            }
            return (
                <li key={item.projectKey} onClick={() => this.props.renderProject(item.projectKey)}>
                    <button>
                        <span><b>{item.projectName + ' (' + item.projectKey + ')'}</b></span>
                        <sub>{"Total tasks: " + totalTasks}</sub>
                        <sub>{"Completed tasks: " + completedTasks}</sub>
                        <sub>{"Tasks in progress: " + tasksInProgress}</sub>
                        <sub>{"Tasks being tested: " + tasksInQA}</sub>
                    </button>
                </li>
            );
        });
        return projectsRender;
    }

    generateAdministratorTasks = () => {
        if (this.state.projectManagerApplications === null || this.state.projectManagerApplications === undefined) {
            return;
        }
        const self = this;
        const applications = this.state.projectManagerApplications;
        var managerApplications = applications.map(element => {
            return (
                <fieldset className="manager-application">
                    <label>
                        <span className="card-title">PROJECT MANGER REQUEST</span>
                        <span className="applicant-name">{element.name}</span>
                        <menu data-ts="Buttons" class="ts-t-t ts-join approve-reject">
                            <li>
                                <button class="ts-primary ts-micro" onClick={() => {
                                    window.ts.ui.Dialog.confirm('Are you sure you want to give PM rights to ' + element.name + '?', {
                                        onaccept: function () {
                                            utils.showBlocker("LOADING");
                                            apiClient.resolvePmApplication(element).then(() => {
                                                utils.hideBlocker();
                                                self.reloadDashboard();
                                            });
                                        },
                                    });
                                }}>
                                    <span>APPROVE</span>
                                </button>
                            </li>
                            <li>
                                <button class="ts-danger ts-micro">
                                    <span>DENY</span>
                                </button>
                            </li>
                        </menu>
                    </label>
                </fieldset>
            );
        });
        return managerApplications;
    }

    mapStatusIcons = (status) => {
        switch (status) {
            case 'TO DO':
                return 0;
            case 'IN PROGRESS':
                return 1;
            case 'IN QA':
                return 2;
            case 'DONE':
                return 3;
        }
        return 'N/A';
    }

    styleCompanyCard = () => {
        console.log("here");
        if (this.state.shouldRemoveIcon) {
            const elements = document.getElementsByClassName('ts-companycard-industry');
            for (var x = 0; x < elements.length; x++) {
                if (elements[x].children[0].localName === "i")
                    elements[x].removeChild(elements[x].children[0]);
            }
            const iconedElements = document.getElementsByClassName('ts-companycard-location');
            for (var y = 0; y < iconedElements.length; y++) {
                iconedElements[y].children[0].classList.remove("ts-icon-location");
                iconedElements[y].children[0].classList.add('ts-icon-archive');
            }
        } else {
            return;
        }
    }

    componentDidUpdate() {
        this.styleCompanyCard();
    }

    componentWillUnmount() {
        utils.hideBlocker();
    }

    render() {
        return (
            <div className='dashboard-wrapper'>
                <div className="common-layout">
                    <div className='left-component'>
                        <h2>Assigned to me</h2>
                        {this.generateTasksAssignedToMe()}
                    </div>
                    <div className="lineV" />
                    <div className="lineV2" />
                    <div className="right-component">
                        <h2>Open issues</h2>
                        {this.generateOpenTasks()}
                    </div>
                    <div className="clear" />
                </div>
                <div className="special-layout">
                    <h2>{this.state.roles.includes(roles.ADMINISTRATOR) || this.state.roles.includes(roles.PROJECT_MANAGER) ? 'Special tasks' : ''}</h2>
                    <h3>{this.state.roles.includes(roles.PROJECT_MANAGER) ? 'Projects managed by me' : ''}</h3>
                    <menu data-ts="Menu">
                        {this.generateProjectsManagedList()}
                    </menu>
                    <h3>{this.state.roles.includes(roles.ADMINISTRATOR) ? 'Administrative requests' : ''}</h3>
                    <menu data-ts="Menu">
                        {this.generateAdministratorTasks()}
                    </menu>
                </div>
                <div className="clear" />
            </div>
        );
    }
}

export default Dashboard;

