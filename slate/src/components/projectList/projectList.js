import React, { Component } from 'react';
import apiClient from '../../ApiClient';
import * as utils from '../../utils';
import { PropTypes } from 'prop-types';

import styles from './projectList.css';

class ProjectList extends Component {

    constructor(props) {
        super(props);
        this.state = {
            filter: '',
            projects: null
        };
    }

    static propTypes = {
        selectProject: PropTypes.func
    }

    renderFooter = () => {
        window.ts.ui.Footer.show();
        window.ts.ui.Footer.buttons().clear();
        window.ts.ui.Footer.buttons(
            [{
                label: 'CREATE PROJECT', type: 'ts-primary', onclick: this.props.createProject
            },
            {
                label: 'DASHBOARD', type: 'ts-primary', onclick: this.props.returnHome
            }]
        );
    }

    componentDidMount = () => {
        utils.showBlocker("LOADING");
        apiClient.getProjects().then((data) => {
            this.setState({ projects: data });
            utils.hideBlocker();
        });
        window.ts.ui.ready(this.renderFooter);
    }

    componentDidUpdate = () => {
        window.ts.ui.get("#projectSearch").onsearch = (value) => this.setState({filter: value});
    }

    renderProjectResults = () => {
        if (this.state.projects !== null) {
            let projectList = this.state.projects;
            if (this.state.filter) {
                let filteredByName = projectList.filter((item) => {
                    if (item.projectName.toLowerCase().indexOf(this.state.filter.toLowerCase()) !== -1) {
                        return true;
                    }
                });
                let filteredByKey = projectList.filter((item) => {
                    if (item.projectKey.indexOf(this.state.filter.toUpperCase()) !== -1) {
                        return true;
                    }
                });
                if (filteredByName.length > 0) {
                    projectList = filteredByName;
                } else if (filteredByKey.length > 0) {
                    projectList = filteredByKey;
                } else {
                    return;
                }
            }
            projectList = projectList.sort((a,b) => {
                if(a.projectKey > b.projectKey) {
                    return 1;
                } else if(a.projectKey < b.projectKey) {
                    return -1;
                }
                return 0;
            });
            let renderedList = projectList.map((item, index) => {
                return (
                    <li onClick={() => this.selectProject(item)}>
                        <button className="project-item">
                            <span><b>{item.projectName + " (" + item.projectKey + ")"}</b></span>
                            <sub><b>{"Project manager: " + item.projectManager.name}</b></sub>
                            <sub>{this.compareDate(item.startingDate)}<time data-ts="Time" datetime={item.startingDate} /></sub>
                        </button>
                    </li>
                );
            });

            return renderedList;
        }
    }

    selectProject = (project) => {
        this.props.selectProject(project.projectKey);
    }

    compareDate = (date) => {
        let now = new Date().toLocaleDateString();
        date = date.split('-').reverse().join('/');
        if(now >= date) {
            return "Project started ";
        } else {
            return "Project will start ";
        }
    }

    render() {
        return (
            <div className="project-list-wrapper">
                <h1 className="project-title">Project list</h1>
                <div data-ts="Search" id="projectSearch" className="ts-inset ts-expanded project-search" {..."data-ts.info=Search amongst projects"}></div>
                <menu data-ts="Menu">
                    {this.renderProjectResults()}
                </menu>
            </div>
        );
    }
}

export default ProjectList;