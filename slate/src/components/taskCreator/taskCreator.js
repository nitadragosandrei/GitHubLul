import React from 'react';

class TaskCreator extends React.Component {
    
    constructor(props) {
        super(props);
        this.state = {
            
        };
    }

    generateUsers = () => {
        var userOptions = this.props.users.map((item, index) => {
            return <option value={item.userId}>{item.name}</option>
        });
        return userOptions;
    }

    validateData = () => {
        const button = document.getElementById('continue-and-create');
        if(this.state.title !== null && this.state.title !== undefined && this.state.title !== '' &&
            this.state.storyPoints !== null && this.state.storyPoints !== undefined &&
            this.state.description !== null && this.state.description !== undefined && this.state.description !== '' ) {
                button.removeAttribute('disabled');
        } else {
            if(button)
                button.setAttribute('disabled','true');
        }
    }

    createTask = () => {
        let now = new Date().toLocaleDateString();
        now = now.split('/').reverse().join('-');
        let task = {
            id: this.props.id,
            title: this.state.title,
            assignedTo: this.state.assignedTo || 'unassigned',
            description: this.state.description,
            storyPoints: this.state.storyPoints,
            status: "TO DO",
            dateCreated: now,
            dateUpdated: now,
            createdBy: this.props.userName
        };
        this.props.createTaskCallback(task);
    }

    render() {
        return(
            <div className="task-creator-wrapper">
                <div data-ts="Form">
                    <fieldset>
                        <label>
                            <span>TITLE*</span>
                            <input type="text" onChange={(event) => this.setState({title: event.target.value})}/>
                        </label>
                    </fieldset>
                    <fieldset>
                        <label>
                            <span>ASSIGNED TO</span>
                            <select id="assignedTo" onChange={(event) => this.setState({assignedTo: event.target.value})}>
                                <option value="unassigned">unassigned</option>
                                {this.generateUsers()}
                            </select>
                        </label>
                    </fieldset>
                    <fieldset>
                        <label>
                            <span>DESCRIPTION*</span>
                            <textarea id="description" onChange={(event) => this.setState({description: event.target.value})}></textarea>
                        </label>
                    </fieldset>
                    <fieldset>
                        <label>
                            <span>STORY POINTS*</span>
                            <input type="number" id="storyPoints" onChange={(event) => this.setState({storyPoints: event.target.value})} />
                        </label>
                    </fieldset>
                </div>
                <br></br>
                <menu data-ts="Buttons">
                    <li onClick={this.createTask}>
                        <button id="continue-and-create" className="ts-primary" disabled>
                            <span>Create task</span>
                        </button>
                    </li>
                </menu>
                {this.validateData()}
            </div>
        );
    }
}

export default TaskCreator;