import queryString from 'query-string';
import fetch from 'isomorphic-fetch';
import React, {Component} from 'react';
import {render} from 'react-dom';

class Status extends Component {
    constructor(props) {
        super(props);
        this.state = {
            status: '',
            errorMessage: ''
        };
    }

    componentWillMount() {
        // User visits this URL:
        // https://plot.ly/o/authorize/?response_type=token&client_id=5sS4Kxx8lqcprixXHKAaCGUCXqPCEVLnRNTGeNQU&redirect_uri=http://localhost:9000/oauth
        // and gets redirected to this URL:
        // http://localhost:9000/static/oauth.html#access_token=bn0RNe2Ec57BUuzziDSoIBIcrZyRNZ&token_type=Bearer&state=&expires_in=36000&scope=read+write
        // we save the access_token

        const params = queryString.parse(location.hash);
        const {access_token} = params;

        window.queryString = queryString;

        this.setState({status: 'loading'});
        fetch('./token', {
            credentials: 'include',
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                access_token
            })
        })
        .then(res => res.json().then(json => {
            if (res.status >= 200 && res.status < 400) {
                this.setState({status: 'success'});
                setTimeout(() => window.close(), 500 );
            } else if (res.status >= 400) {
                this.setState({
                    status: 'failure',
                    errorMessage: json.error.message
                });
            }
        }))
        .catch(err => {
            this.setState({status: 'failure'});
        });
    }

    render() {

        const {errorMessage, status} = this.state;
        let content = null;
        if (status === 'loading') {
            content = (
                <h4>
                    {'Authorizing...'}
                </h4>
            );
        } else if (status === 'success') {
            content = (
                <div>
                    <h4>{'Authorized!'}</h4>
                </div>
            );
        } else if (status === 'failure') {
            content = (
                <div>
                    <h4>
                        {'Yikes! An error occurred while trying to authorize.'}
                    </h4>
                    {errorMessage ? (
                        <pre>
                            {`Error: ${errorMessage}`}
                        </pre>
                    ) : null}
                </div>
            );
        }
        return (
            <div style={{paddingTop: '30%', textAlign: 'center'}}>
                {content}
            </div>
        );
    }

}

render(<Status/>, document.getElementById('root'));
