import React, { Component } from 'react';
import apiClient from '../../ApiClient';
import { PropTypes } from 'prop-types';
import * as utils from '../../utils';

import styles from './createProject.css'

class CreateProject extends Component {

    constructor(props) {
        super(props);
        this.state = {
            projectName: '',
            projectKey: '',
            type: '',
            projectManager: '',
            startingDate: '',
            currentProjectManagers: null,
        };
    }

    static propTypes = {
        returnHome: PropTypes.func
    }

    componentDidMount = () => {
        window.ts.ui.ready(this.buildCreateProjectFooter);
        utils.showBlocker("LOADING");
        apiClient.projectManagers().then((managers) => {
            this.setState({ currentProjectManagers: this.populateProjectManagers(managers) });
            utils.hideBlocker();
        });
    }

    buildCreateProjectFooter = () => {
        window.ts.ui.Footer.show();
        window.ts.ui.Footer.buttons().clear();
        window.ts.ui.Footer.buttons([
            {
                label: 'BACK', type: 'ts-secondary', id: 'back', 'disabled': 'false', onclick: this.props.returnHome
            },
            {
                label: 'SAVE & CONTINUE', type: 'ts-primary', 'disabled': 'true', id: 'save', onclick: this.saveAndContinue
            }
        ]);
        window.ts.ui.Footer.buttons()[0].enable();
    }

    populateProjectManagers = (managers) => {
        var managerList = managers.map((element, index) => {
            return <option key={element.userId}>{element.name}</option>;
        });
        return managerList;
    }

    validateData = () => {
        window.ts.ui.Footer.buttons()[1].disable();
        if (this.state.projectName && this.state.projectKey && this.state.type && this.state.projectManager && this.state.startingDate && this.state.projectKey !== 'ERROR') {
            window.ts.ui.Footer.buttons()[1].enable();
        }
    }

    inputStartingDate = () => {
        if (window.ts.ui.get('startingDate')) {
            this.setState({ startingDate: window.ts.ui.get('startingDate').value })
        }
    }

    inputProjectName = (event) => {
        this.setState({ projectName: event.target.value });
        this.inputStartingDate();
    }

    inputKey = (event) => {
        if (event.target.value.length < 3 || event.target.value.length > 5) {
            this.setState({ projectKey: 'ERROR' });
        } else {
            this.setState({ projectKey: event.target.value.toUpperCase() });
        }
        this.inputStartingDate();
    }

    inputType = (event) => {
        this.setState({ type: event.target.value });
        this.inputStartingDate();
    }

    inputProjectManager = (event) => {
        let manager = {
            name: event.target.options[event.target.selectedIndex].text,
            userId: event.target.value
        }
        this.setState({ projectManager: manager });
        this.inputStartingDate();
    }

    showError = (visible, message) => {
        if (visible === true) {
            return (
                <dl className="ts-errors">
                    {message}
                </dl>
            );
        }
    }

    requestProjectManager = () => {
        let user = this.props.user;
        let email = this.props.email;
        let userId = this.props.userId;
        window.ts.ui.Dialog.confirm('Are you sure you want PM rights for\n' + user + ' (' + email + ')?', {
            onaccept: function () {
                window.ts.ui.Notification.success('Request sent. Check your email in 2 to 5 hours');
                let futurePM = {
                    name: user,
                    email: email,
                    userId: userId
                }
                apiClient.pmApplication(futurePM);
            }
        });
    }

    saveAndContinue = () => {
        const { returnHome } = this.props;
        window.ts.ui.Footer.buttons().get('save').busy();
        apiClient.getProjects().then((items) => {
            if (items.length > 0) {
                let check = items.filter((element) => {
                    return element.projectKey === this.state.projectKey;
                });
                if (check.length > 0) {
                    this.setState({ projectKey: 'ERROR' });
                    window.ts.ui.Footer.buttons().get('save').busy('false');
                } else {
                    let project = {
                        projectName: this.state.projectName,
                        projectKey: this.state.projectKey,
                        projectManager: this.state.projectManager,
                        type: this.state.type,
                        startingDate: this.state.startingDate,
                        backlog: []
                    };
                    apiClient.saveProject(project).then((data) => {
                        returnHome();
                    }).catch((error) => {
                        if (error) {
                            window.ts.ui.Notification.error('Failed to verify uniqueness');
                        }
                        window.ts.ui.Footer.buttons().get('save').busy('false');
                    });
                }
            }
        }).catch((error) => {
            if (error) {
                window.ts.ui.Notification.error('Failed to save the project');
            }
        });
    }

    render() {
        this.validateData();
        return (
            <div className="wrapper create-project" >
                <div className="create-project-content">
                    <div className="panel">
                        <header>
                            Create new project
                        </header>
                        <hr style={{ height: '1px', border: 'none', color: '#333', backgroundColor: '#333' }}></hr>
                        <div className="panel-content">
                            <div data-ts="Form" id="create-project-form">
                                <fieldset>
                                    <label>
                                        <span>PROJECT NAME</span>
                                        <input type="text" id="projectName" onChange={this.inputProjectName} />
                                    </label>
                                </fieldset>
                                <fieldset>
                                    <label>
                                        <span>STARTING DATE</span>
                                        <input type="date" id='startingDate' />
                                    </label>
                                </fieldset>
                                <fieldset>
                                    <label className={this.state.projectKey === 'ERROR' ? 'ts-error' : ''}>
                                        <span>KEY</span>
                                        <input type="text" id="projectKey" onChange={this.inputKey} />
                                    </label>
                                    {this.showError(this.state.projectKey === 'ERROR', 'Length must be greater than 2 and less than 5 and key must be unique!')}
                                    <dl className="ts-info">
                                        <dt>Unique identifier for the project</dt>
                                        <dd>3 to 5 uppercase letters</dd>
                                        <dd>Ex. Slate Enterprise Platform Project - SEPP</dd>
                                    </dl>
                                </fieldset>
                                <fieldset>
                                    <label>
                                        <span>TYPE</span>
                                        <select onChange={this.inputType}>
                                            <option></option>
                                            <option value="software">Software</option>
                                            <option value="support">Customer Support</option>
                                            <option value="intelligence">Intelligence</option>
                                        </select>
                                    </label>
                                </fieldset>
                                <fieldset>
                                    <label>
                                        <span>PROJECT MANAGER</span>
                                        <select onChange={this.inputProjectManager}>
                                            <option></option>
                                            {this.state.currentProjectManagers}
                                        </select>
                                    </label>
                                    <dl className="ts-info">
                                        <dt>Can't find your name in the list? Request a project manager role by <a onClick={this.requestProjectManager}>clicking here</a></dt>
                                    </dl>
                                </fieldset>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default CreateProject;