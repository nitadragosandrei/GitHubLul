import React from 'react';

import styles from './Eula.css';
import apiClient from '../../ApiClient';

class Eula extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			eulaAcceptedSuccesfully: false
		};
		this.agreeEULA = this.agreeEULA.bind(this);
	}

	componentDidMount() {
	}

	agreeEULA() {
		const { data } = this.props;
		apiClient.agreeEULA({ eulaVersionId: data.eulaVersionId }).then((() => {
			this.setState({ eulaAcceptedSuccesfully: true });
		}));
	}

	notifyEulaUpdated() {
		const { data } = this.props;
		if (data.showUpdatedMessage === true) {
			return (
				<div data-ts="Note">
					<i className="ts-icon-info"></i>
					<p>Terms and agreements have updated since your last visit. Please revise and accept</p>
				</div>
			);
		}
	}

	render() {

		if (this.state.eulaAcceptedSuccesfully) {
			//return <Redirect to="/home" />;
		}

		const eulaContent = this.props.data.content;
		return (
			<div className="wrapper eula">
				<div className="eula-content">
					<h1>
						<FormattedMessage id="app.vendor" defaultMessage="Coface">
							{(txt) => (
								<span className="vendor-logo">{txt}</span>
							)}
						</FormattedMessage>{' '}
						<FormattedMessage id="app.title" defaultMessage="Risk Management" />
					</h1>
					<h2><FormattedMessage id="app.subtitle" defaultMessage="TAKE ADVANTAGE OF COFACE BUSINESS INFORMATION" /></h2>
					<p className="eula-intro"><FormattedMessage id="eula.intro" /></p>
					{this.notifyEulaUpdated()}
					<p><b><FormattedMessage id="eula.title" /></b></p>
					<div className="panel panel-default">
						<div className="panel-body">
							{eulaContent}
						</div>
					</div>
					<form data-ts="Form" className="Eula-Form">
						<br />
						<button
							data-ts="Button"
							className="ts-primary"
							onClick={this.agreeEULA}>
							<FormattedMessage id="app.buttons.agree" />
						</button>
					</form>
				</div>
			</div>
		);
	}
}

Eula.propTypes = {
	intl: intlShape.isRequired,
};

export default injectIntl(Eula);
