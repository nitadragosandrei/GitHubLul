import React from 'react';


class TaskDisplay extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            editing: false,
            task: this.props.task
        };
    }

    generateUsers = () => {
        var userOptions = this.props.users.map((item, index) => {
            return <option value={item.userId}>{item.name}</option>
        });
        return userOptions;
    }

    generateButton = () => {
        if (this.state.editing) {
            return (
                <button className="ts-primary" onClick={() => {
                    let now = new Date().toLocaleDateString();
                    now = now.split('/').reverse().join('-');
                    let task = this.state.task;
                    task.dateUpdated = now;
                    this.props.saveTask(task); 
                }}>
                    <span>Save & Continue</span>
                </button>
            );
        } else {
            return (
                <button className="ts-secondary" onClick={this.makeEditable}>
                    <span>Edit</span>
                </button>
            );
        }
    }

    makeEditable = () => {
        this.setState({
            editing: true
        });
    }

    assignedToChange = (event) => {
        let item = this.state.task;
        item.assignedTo = event.target.value;
        this.setState({task: item});
    }

    descriptionChange = (event) => {
        let item = this.state.task;
        item.description = event.target.value;
        this.setState({task: item});
    }

    statusChange = (event) => {
        let item = this.state.task;
        item.status = event.target.value;
        this.setState({task: item});
    }

    storyPointsChange = (event) => {
        let item = this.state.task;
        item.storyPoints = event.target.value;
        this.setState({task: item});
    }

    editable = () => {
        if(this.state.editing) {
            document.getElementById('assignedTo').removeAttribute('readOnly');
            document.getElementById('description').removeAttribute('readOnly');
            document.getElementById('status').removeAttribute('readOnly');
            document.getElementById('storyPoints').removeAttribute('readOnly');
        }
    }

    render() {
        return (
            <div className="task-details-wrapper">
                <h2>{this.props.task.title}</h2>
                <div data-ts="Form">
                    <fieldset>
                        <label>
                            <span>CREATED BY</span>
                            <input type="text" value={this.state.task.createdBy} readOnly />
                        </label>
                    </fieldset>
                    <fieldset>
                        <label>
                            <span>ASSIGNED TO</span>
                            <select id="assignedTo" value={this.state.task.assignedTo} onChange={this.assignedToChange} readOnly>
                                <option value=""></option>
                                {this.generateUsers()}
                            </select>
                        </label>
                    </fieldset>
                    <fieldset>
                        <label>
                            <span>DESCRIPTION</span>
                            <textarea id="description" onChange={this.descriptionChange} value={this.state.task.description} readOnly></textarea>
                        </label>
                    </fieldset>
                    <fieldset>
                        <label>
                            <span>STATUS</span>
                            <select id="status" value={this.state.task.status} onChange={this.statusChange} readOnly>
                                <option value=""></option>
                                <option value="TO DO">TO DO</option>
                                <option value="IN PROGRESS">IN PROGRESS</option>
                                <option value="IN QA">IN QA</option>
                                <option value="DONE">DONE</option>
                            </select>
                        </label>
                    </fieldset>
                    <fieldset>
                        <label>
                            <span>STORY POINTS</span>
                            <input type="number" id="storyPoints" value={this.state.task.storyPoints} onChange={this.storyPointsChange} readOnly />
                        </label>
                    </fieldset>
                    <fieldset>
                        <label>
                            <span>DATE CREATED</span>
                            <input type="date" id="dateCreated" value={this.state.task.dateCreated} readOnly />
                        </label>
                    </fieldset>
                    <fieldset>
                        <label>
                            <span>DATE UPDATED</span>
                            <input type="date" id="dateUpdated" value={this.state.task.dateUpdated} readOnly />
                        </label>
                    </fieldset>
                </div>
                <br></br>
                <menu data-ts="Buttons">
                    <li>
                        {this.generateButton()}
                    </li>
                </menu>
            {this.editable()}
            </div>
        );
    }
}

export default TaskDisplay;