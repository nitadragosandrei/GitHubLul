import React from 'react';
import ReactDOM from 'react-dom';
import { PropTypes } from 'prop-types';

const asideRoot = document.getElementById('aside-root');
const asidePanel = asideRoot.querySelector('div.panel');

class Aside extends React.Component {
	static propTypes = {
		title: PropTypes.string.isRequired,
		closeCallback: PropTypes.func
	}

	componentDidMount() {
		asideRoot.setAttribute('data-ts.title', this.props.title);
		const {closeCallback} = this.props;
		window.ts.ui.get(asideRoot, aside => {
			aside.onclosed = closeCallback;
			aside.open();
		});
	}

	componentWillUnmount() {
		asideRoot.removeAttribute('data-ts.title');
	}

	render() {
		return ReactDOM.createPortal(
			this.props.children,
			asidePanel
		);
	}
}

export default Aside;