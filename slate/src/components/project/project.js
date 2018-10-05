import React, { Component } from 'react';
import apiClient from '../../ApiClient';
import Aside from '../aside/aside';
import TaskDisplay from '../taskDisplay/taskDisplay';
import TaskCreator from '../taskCreator/taskCreator';
import * as utils from '../../utils';

import styles from './project.css'

class Project extends Component {

    constructor(props) {
        super(props);
        this.state = {
            projectKey: this.props.projectKey,
            currentProject: null,
            users: null,
            firstUsableIndex: 1,
            moveFromBacklog: false,
            selectedTask: this.props.taskDetails.task || {},
            selectedSprint: this.props.taskDetails.sprint || 0,
            displayedPropTask: false,
            type: "current"
        };
    }

    componentDidMount = () => {
        this.reloadItems("current");
        const self = this;
        window.ts.ui.ready(this.renderFooter);
        window.ts.ui.TabBar.tabs([
            {
                label: 'Current sprint', onselect: () => {
                    self.setState({ type: "current" });
                    self.reloadItems();
                }
            },
            {
                label: 'Future sprints', onselect: () => {
                    self.setState({ type: "future" });
                    self.reloadItems();
                }
            },
            {
                label: 'Past sprints', onselect: () => {
                    self.setState({ type: "past" });
                    self.reloadItems();
                }
            }
        ]);
    }

    componentWillUnmount = () => {
        window.ts.ui.TabBar.tabs().clear();
    }

    renderFooter = () => {
        window.ts.ui.Footer.show();
        window.ts.ui.Footer.buttons().clear();
        window.ts.ui.Footer.buttons(
            [{
                label: 'CREATE TASK', type: 'ts-secondary', onclick: () => {
                    this.setState({
                        createTask: true
                    });
                }
            },
            {
                label: 'NEW SPRINT', type: 'ts-secondary', onclick: this.createSprint,
            },
            {
                label: 'PROJECT LIST', type: 'ts-primary', onclick: this.props.backToProjectList
            }]
        );
    }

    createSprint = () => {
        const self = this;
        let minimumDate = this.state.currentProject.startingDate;
        if (this.state.currentProject.sprints) {
            this.state.currentProject.sprints.forEach((item, index) => {
                if (item.startingDate > minimumDate) {
                    minimumDate = item.startingDate;
                }
            });
        }
        window.ts.ui.Dialog.confirm('Are you sure you want to create a new sprint?', {
            onaccept: () => {
                window.ts.ui.Notification.success('Please select a starting date');
                var datePicker = window.ts.ui.DatePicker({
                    title: "Starting date",
                    min: minimumDate,
                    onselect: function (newval, oldval) {
                        window.ts.ui.Notification.success("Sprint created");
                        let proj = self.state.currentProject;
                        let newSprint = {
                            tasks: [],
                            startingDate: this.value,
                            id: self.state.firstUsableSprintId,
                            type: "future"
                        };
                        if (proj.sprints) {
                            proj.sprints.push(newSprint);
                        }
                        else {
                            proj.sprints = new Array();
                            proj.sprints.push(newSprint);
                        }
                        self.setState({
                            currentProject: proj
                        });
                        utils.showBlocker("Loading");
                        apiClient.saveProject(proj).then(() => {
                            self.reloadItems();
                        });
                        this.close();
                    },
                    onclosed: function () {
                        if (!this.value)
                            window.ts.ui.Notification.warning("Sprint not created");
                        this.dispose();
                    }
                });
                datePicker.open();
            }
        });
    }

    reloadItems = () => {
        utils.showBlocker("LOADING");
        apiClient.project(this.props.projectKey).then((data) => {
            var project = data;
            apiClient.users().then((usrs) => {
                this.setState({
                    users: usrs,
                    currentProject: project
                });
                utils.hideBlocker();
                this.populateSprintTable();
                this.populateBacklogTable();
                this.calculateLastUsableIndex();
                this.calculateSprintId();
                if (!this.state.displayedPropTask) {
                    this.setState({
                        displayTask: this.props.taskDetails.displayTask,
                        displayedPropTask: true
                    });
                }
            });
        });
    }

    renderDashboard = (type) => {
        if (this.state.currentProject === null) {
            return;
        }
        const self = this;
        let sprints = this.state.currentProject.sprints || null;
        if (sprints === null) {
            return (
                <p>The project contains no sprints! Please create a sprint</p>
            );
        } else {
            let content = sprints.map((item, index) => {
                if (item.type === type) {
                    return (
                        <div className="sprint-table-wrapper" key={item.id}>
                            <div className="sprint-details">
                                <h2>{item.closed ? "(CLOSED) " : "" + this.state.currentProject.projectName + " - Sprint " + item.id}</h2>
                                {this.renderSprintDate(item, 'starting')}
                                {this.renderSprintDate(item, 'done')}
                            </div>
                            <div data-ts="Table" id={this.state.projectKey + "-sprint-" + item.id} className="sprint-table" />
                        </div>
                    );
                }
            });
            return content;
        }
    }

    modifyNextSprint = (currentState, futureState) => {
        let found = false;
        let sprints = this.state.currentProject.sprints;
        if (sprints === null || sprints === undefined) {
            return;
        } else {
            sprints.forEach((item) => {
                if (found === false && (item.type === currentState)) {
                    item.type = futureState;
                }
            });
        }
        let project = this.state.currentProject;
        project.sprints = sprints;
        utils.showBlocker("LOADING");
        const self = this;
        apiClient.saveProject(project).then(() => self.reloadItems());

    }

    renderSprintDate = (item, dateType) => {
        if (dateType === 'starting') {
            if (item.startingDate !== null && item.startingDate !== undefined && item.startingDate !== '') {
                return (
                    <p>{"Starting date: " + item.startingDate}</p>
                );
            }
        } else if (dateType === 'done') {
            if (item.doneDate !== null && item.doneDate !== undefined && item.doneDate !== '') {
                return (
                    <p>{"End date: " + item.doneDate}</p>
                );
            }
        }
    }

    populateSprintTable = () => {
        if (this.state.currentProject === null) {
            return;
        }
        let sprints = this.state.currentProject.sprints;
        if (sprints === null || sprints === undefined) {
            return;
        }
        sprints.map((item, index) => {
            let key = '#' + this.state.projectKey + '-sprint-' + item.id;
            window.ts.ui.get(key, (table) => {
                table.cols([
                    {
                        label: "Item ID",
                        flex: 1,
                        width: 100
                    },
                    {
                        label: "Task",
                        flex: 3
                    },
                    {
                        label: "Status",
                        width: 100
                    },
                    {
                        label: "Assignee",
                        width: 150
                    },
                    {
                        label: "Story points",
                        width: 100
                    },
                    {
                        label: "Details",
                        width: 100
                    }
                ]);
                const formattedTableData = this.formatTableData(item);
                table.rows(formattedTableData);
                table.onbutton = this.handleTableClick.bind(this);
            });
        });
    }

    handleTableClick = (name, value, rowIndex, colIndex) => {
        let sprint = this.state.currentProject.sprints.filter((item) => { return item.id === value.sprint })[0];
        if (sprint != null) {
            let selectedItem = sprint.tasks.filter((item) => { return item.id === value.selectedItem })[0];
            if (selectedItem !== null) {
                this.setState({
                    displayTask: true,
                    selectedTask: selectedItem,
                    selectedSprint: value.sprint
                });
            }
        }
    }

    asideCallback = () => {
        this.setState({
            displayTask: false,
            selectedTask: {}
        });
    }

    assigned = (person) => {
        if (person !== 'unassigned') {
            let user = this.state.users.filter((elem, index) => { return elem.userId === person });
            if (user) {
                return user[0].name;
            } else {
                return 'unassigned';
            }
        } else {
            return 'unassigned';
        }
    }

    formatTableData = (data) => {
        let formattedData = [];
        data.tasks.forEach((item, index) => {
            let obj = {
                cells: []
            };
            //ID
            obj.cells.push({
                text: item.id,
                type: 'item-id'
            });
            //Task title
            obj.cells.push({
                text: item.title,
                type: 'item-title'
            });
            //Status
            obj.cells.push({
                text: item.status,
                type: 'item-status'
            });
            //Assignee
            obj.cells.push({
                text: this.assigned(item.assignedTo),
                type: 'item-assignee'
            });
            //Story points
            obj.cells.push({
                text: item.storyPoints,
                type: 'item-story-points'
            });
            obj.cells.push({
                item: 'Button',
                label: 'DETAILS',
                type: 'ts-tertiary ts-micro',
                name: 'task-details',
                value: {
                    sprint: data.id,
                    selectedItem: item.id
                }
            });
            formattedData.push(obj);
        });
        return formattedData;
    }

    populateBacklogTable = () => {
        if (this.state.currentProject === null) {
            return;
        }
        let backlog = this.state.currentProject.backlog;
        if (backlog === null || backlog === undefined) {
            return;
        }
        window.ts.ui.get('backlog', (table) => {
            table.cols([
                {
                    label: "Item ID",
                    flex: 1,
                    width: 100
                },
                {
                    label: "Task",
                    flex: 3
                },
                {
                    label: "Status",
                    width: 100
                },
                {
                    label: "Assignee",
                    width: 150
                },
                {
                    label: "Story points",
                    width: 100
                },
                {
                    label: "Move",
                    width: 100
                }
            ]);
            const formattedTableData = this.formatBacklogData(backlog);
            table.rows(formattedTableData);
            table.onbutton = this.handleClickBacklog.bind(this);
        });
    }

    formatBacklogData = (data) => {
        let formattedData = [];
        data.forEach((item, index) => {
            let obj = {
                cells: []
            };
            //ID
            obj.cells.push({
                text: item.id,
                type: 'item-id'
            });
            //Task title
            obj.cells.push({
                text: item.title,
                type: 'item-title'
            });
            //Status
            obj.cells.push({
                text: item.status,
                type: 'item-status'
            });
            //Assignee
            obj.cells.push({
                text: this.assigned(item.assignedTo),
                type: 'item-assignee'
            });
            //Story points
            obj.cells.push({
                text: item.storyPoints,
                type: 'item-story-points'
            });
            obj.cells.push({
                item: 'Button',
                label: 'MOVE',
                type: 'ts-primary ts-micro',
                name: 'task-details',
                value: {
                    selectedItem: item.id
                }
            });
            formattedData.push(obj);
        });
        return formattedData;
    }

    handleClickBacklog = (name, value, rowIndex, colIndex) => {
        const task = this.state.currentProject.backlog.filter((item, index) => {
            return item.id === value.selectedItem;
        });
        this.setState({
            selectedTask: task[0],
            moveFromBacklog: true
        });
    }

    moveTaskInSprint = (taskId, sprintId) => {
        const asideRoot = document.getElementById('aside-root');
        window.ts.ui.get(asideRoot, aside => {
            aside.close();
        });
        let thisProject = this.state.currentProject;
        let task;
        thisProject.backlog = thisProject.backlog.filter((item, index) => {
            if (item.id === taskId) {
                task = item;
                return false;
            } else {
                return true;
            }
        });
        thisProject.sprints.forEach((item, index) => {
            if (item.id === sprintId) {
                item.tasks.push(task);
            }
        });
        this.setState({
            currentProject: thisProject
        });
        const self = this;
        utils.showBlocker("LOADING");
        apiClient.saveProject(thisProject).then(() => {
            self.reloadItems();
        });
    }

    renderTaskMover = () => {
        if (this.state.moveFromBacklog !== true) {
            return;
        }
        if (this.state.currentProject.sprints === null || this.state.currentProject.sprints === undefined) {
            window.ts.ui.Notification.error('There are no sprints in this project. Please create a sprint before moving tasks');
            return;
        }
        const sprintSelectors = this.state.currentProject.sprints.map((item, index) => {
            return (
                <li onClick={() => this.moveTaskInSprint(this.state.selectedTask.id, item.id)}>
                    <button>
                        <span>Sprint {item.id}</span>
                    </button>
                </li>
            );
        });
        return (
            <Aside title="Move task" closeCallback={this.taskMoverCallback}>
                <menu data-ts="Menu">
                    {sprintSelectors}
                </menu>
            </Aside>
        );
    }

    taskMoverCallback = () => {
        this.setState({
            moveFromBacklog: false
        });
    }

    calculateLastUsableIndex = () => {
        var largestIndex = 0;
        let sprints = this.state.currentProject.sprints;
        let backlog = this.state.currentProject.backlog;
        if (sprints !== null && sprints !== undefined) {
            sprints.forEach((sprint, index) => {
                if (sprint.tasks !== null && sprint.tasks !== undefined) {
                    sprint.tasks.forEach((task, index) => {
                        let idNumber = parseInt(task.id.split('-')[1]);
                        if (idNumber > largestIndex) {
                            largestIndex = idNumber;
                        }
                    });
                }
            });
        }
        if (backlog !== null && backlog !== undefined) {
            backlog.forEach((task, index) => {
                let idNumber = parseInt(task.id.split('-')[1]);
                if (idNumber > largestIndex) {
                    largestIndex = idNumber;
                }
            })
        }
        this.setState({
            firstUsableIndex: largestIndex + 1
        });
    }

    calculateSprintId = () => {
        let sprintId = 0;
        if (this.state.currentProject.sprints !== null && this.state.currentProject.sprints !== undefined) {
            this.state.currentProject.sprints.forEach((item, index) => {
                if (parseInt(item.id) > sprintId) {
                    sprintId = parseInt(item.id);
                }
            });
        }
        this.setState({
            firstUsableSprintId: sprintId + 1
        });
    }

    displayDetails = () => {
        if (this.state.displayTask) {
            return (
                <Aside title={this.state.selectedTask.id} closeCallback={this.asideCallback}>
                    <TaskDisplay task={this.state.selectedTask} users={this.state.users} saveTask={this.saveTaskCallback} />
                </Aside>
            );
        }
    }

    saveTaskCallback = (newTask) => {
        var thisSprint = this.state.currentProject.sprints.filter((item) => { return item.id === this.state.selectedSprint })[0];
        thisSprint.tasks.forEach((item, index) => {
            if (item.id === newTask.id) {
                item = JSON.parse(JSON.stringify(newTask));
            }
        });
        const asideRoot = document.getElementById('aside-root');
        window.ts.ui.get(asideRoot, aside => {
            aside.close();
        });
        var proj = this.state.currentProject
        proj.sprints.forEach((item, index) => {
            if (item.id === thisSprint.id) {
                item = thisSprint;
            }
        });
        this.setState({
            displayTask: false,
            selectedTask: {},
            selectedSprint: 0,
            currentProject: proj
        });
        const self = this;
        utils.showBlocker("LOADING");
        apiClient.saveProject(proj).then(() => {
            self.reloadItems();
        });
    }

    renderTaskCreate = () => {
        if (this.state.createTask) {
            return (
                <Aside title="Create task" closeCallback={this.createTaskAsideCallback}>
                    <TaskCreator id={this.state.projectKey + '-' + this.state.firstUsableIndex} createTaskCallback={this.taskCreateCallback} userName={this.props.loggedInUser} users={this.state.users} />
                </Aside>
            );
        }
    }

    createTaskAsideCallback = () => {
        this.setState({
            createTask: false
        });
    }

    taskCreateCallback = (task) => {
        const asideRoot = document.getElementById('aside-root');
        window.ts.ui.get(asideRoot, aside => {
            aside.close();
        });
        var proj = this.state.currentProject;
        if (proj.backlog === null || proj.backlog === undefined) {
            proj.backlog = new Array();
        }
        proj.backlog.push(task);
        utils.showBlocker("LOADING");
        this.setState({
            currentProject: proj
        });
        const self = this;
        apiClient.saveProject(proj).then(() => {
            self.reloadItems();
        });
    }

    renderSprintManipulatorButtons = () => {
        const self = this;
        if (this.state.type === "current") {
            return (
                <button data-ts="Button" className="ts-secondary ts-micro sprint-manipulator" onClick={() => self.modifyNextSprint('current', 'past')}>
                    <span>End sprint</span>
                </button>
            );
        } else if (this.state.type === "future") {
            return (
                <button data-ts="Button" className="ts-secondary ts-micro sprint-manipulator" onClick={() => self.modifyNextSprint('future', 'current')}>
                    <span>Start next sprint</span>
                </button>
            );
        }
    }

    render() {
        return (
            <div className="project-wrapper">
                {this.renderSprintManipulatorButtons()}
                {this.renderDashboard(this.state.type)}
                {this.displayDetails()}
                {this.renderTaskMover()}
                {this.renderTaskCreate()}
                <div className="sprint-table-wrapper">
                    <div className="sprint-details">
                        <h2>Backlog</h2>
                    </div>
                    <div data-ts="Table" id="backlog" className="sprint-table" />
                </div>
            </div>
        );
    }
}

export default Project;