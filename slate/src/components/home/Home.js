import React, { Component } from 'react';
import apiClient from '../../ApiClient';
import * as utils from '../../utils';

import CreateProject from '../createProject/createProject';
import ProjectList from '../projectList/projectList';
import Project from '../project/project';
import Dashboard from '../dashboard/dashboard';

const mock = false;

const steps = {
    HOME: 'HOME',
    CREATE_PROJECT: 'CREATE-PROJECT',
    PROJECT_LIST: 'PROJECT-LIST',
    PROJECT_VIEW: 'PROJECT-VIEW'
}

class Home extends Component {

    constructor(props) {
        super(props);
        this.state = {
            userName: mock ? 'Vlad Gaujaneanu' : '',
            email: mock ? 'vlad.gaujaneanu@gmail.com' : '',
            userId: mock ? 'dbc29795797bea1dd1c680d73578bc800f81ce88b6eaaa6b1524eb49e6cb83b7' : '',
            roles: mock ? ['PROJECT_MANAGER', 'ADMINISTRATOR'] : [],
            step: mock ? steps.HOME : '',
            selectedProject: null
        }
    }

    componentDidMount = () => {
        window.ts.ui.TopBar.title("SLATE");
        const token = new URLSearchParams(window.location.search).get('authorization_token');
        if (token) {
            utils.showBlocker("LOGGING IN");
        }
        apiClient.whoami().then((response) => {
            utils.hideBlocker();
            this.setState({ userName: response.name, email: response.email, roles: response.roles, userId: response.userId, step: steps.HOME });
            window.history.replaceState({}, document.title, "/" + "index.html");
        });
    }

    buildHomeFooter = () => {
        window.ts.ui.Footer.show();
        window.ts.ui.Footer.buttons().clear();
        window.ts.ui.Footer.buttons(
            [{
                label: 'CREATE PROJECT', type: 'ts-primary', onclick: () => {
                    this.setState({ step: steps.CREATE_PROJECT });
                },
            },
            {
                label: 'PROJECT LIST', type: 'ts-primary', onclick: () => {
                    this.setState({ step: steps.PROJECT_LIST });
                }
            }]
        );
    }

    loginButton = () => {
        var buttons = window.ts.ui.TopBar.buttons();
        buttons.clear();
        buttons.push({ id: 'user-name-label' });
        var userNameLabel = buttons.get('user-name-label');
        userNameLabel.label = this.state.userName || 'LOGIN';
        userNameLabel.type = 'ts-primary';
        if (this.state.userName && userNameLabel != null) {
            userNameLabel.disable();
        } else if (userNameLabel != null) {
            userNameLabel.enable();
            userNameLabel.onclick = () => {
                window.location.replace(process.env.REACT_APP_LOGIN_REDIRECT_URL);
            };
        }
    }

    home = () => {
        this.setState({ step: steps.HOME });
    }

    createProjectStep = () => {
        this.setState({ step: steps.CREATE_PROJECT });
    }

    projectListStep = () => {
        this.setState({
            step: steps.PROJECT_LIST,
            selectedProject: '',
            taskDetails: null
        });
    }

    renderProject = (projectKey) => {
        this.setState({
            step: steps.PROJECT_VIEW,
            selectedProject: projectKey
        })
    }

    renderSpecificTask = (task, projectKey) => {
        this.setState({
            taskDetails: task,
            selectedProject: projectKey,
            step: steps.PROJECT_VIEW
        })
    }

    renderStep = () => {
        if (this.state.step === steps.HOME) {
            window.ts.ui.ready(this.buildHomeFooter);
            return (
                <Dashboard
                    currentUser={this.state.userId}
                    roles={this.state.roles}
                    renderProject={this.renderProject}
                    jumpToTask={this.renderSpecificTask}
                />
            );
        } else if (this.state.step === steps.CREATE_PROJECT) {
            return (
                <CreateProject
                    user={this.state.userName}
                    email={this.state.email}
                    userId={this.state.userId}
                    returnHome={this.home}
                />
            );
        } else if (this.state.step === steps.PROJECT_LIST) {
            return (
                <ProjectList
                    selectProject={this.renderProject}
                    returnHome={this.home}
                    createProject={this.createProjectStep}
                />
            );
        } else if (this.state.step === steps.PROJECT_VIEW) {
            return (
                <Project
                    projectKey={this.state.selectedProject}
                    returnHome={this.home}
                    loggedInUser={this.state.userName}
                    backToProjectList={this.projectListStep}
                    taskDetails={this.state.taskDetails || {}} />
            );
        }
    }

    render() {
        this.loginButton();
        return (
            <div className="home-wrapper">
                {this.renderStep()}
            </div>
        );
    }
}

export default Home;