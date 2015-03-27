var Router = ReactRouter;
var Route = ReactRouter.Route;
var RouteHandler = ReactRouter.RouteHandler;
var Link = ReactRouter.Link;
var DefaultRoute = ReactRouter.DefaultRoute;

var App = React.createClass({
  render: function () {
    return (
      <div className="App">
        <h1>Heroku Support</h1>
        <div className="col-xs-12">
          <RouteHandler/>
        </div>
      </div>
    );
  }
});

var TicketSpend = React.createClass({
  render: function() {
    level = "-";
    if(this.props.spend == 0) {
      level ="Free"
    } else if(this.props.spend < 100) {
      level ="Paid"
    } else if(this.props.spend < 500) {
      level ="$100+"
    } else if(this.props.spend >= 500) {
      level ="$500+"
    };
    return (
      <span>
        {level}
      </span>
    )
  }
});

var TicketRow = React.createClass({
  render: function() {
    return (
      <tr>
        <td> #{this.props.ticket.id} </td>
        <td>
          <Link to="ticket" params={{ ticketId: this.props.ticket.id  }}>{this.props.ticket.subject}</Link>
        </td>
        <td>
          <TicketSpend spend={this.props.ticket.spend} />
        </td>
      </tr>
    )
  }
});

var Comments = React.createClass({
  getInitialState: function() {
    return ({comments: []})
  },
  componentDidMount: function() {
    $.ajax({
      url: "https://support-api.heroku.com/tickets/" + this.props.ticketId + "/comments",
      headers: {
        "Authorization": "Bearer " + window.token,
        "Accept": "application/vnd.heroku+json; version=1"
      },
      success: function(comments) {
        this.setState({comments: comments})
      }.bind(this)
    })
  },
  render: function() {
    rows = [];
    this.state.comments.forEach(function(comment) {
      rows.push(<Comment comment={comment} />);
    })
    return (
      <div className="comments">
        {rows}
      </div>
    )
  }
});

var Comment = React.createClass({
  render: function() {
    return (
      <div className='row'>
        <div className='col-xs-2 u-padding-Am'>
          {this.props.comment.actor.email}
        </div>
        <div className='col-xs-10'>
          <div className='comment purple-box u-padding-Am u-margin-Am'>
            {this.props.comment.body}
          </div>
        </div>
      </div>
    )
  }
});

var TicketList = React.createClass({
  render: function() {
    var rows = [];
    this.props.tickets.forEach(function(ticket) {
      rows.push(<TicketRow ticket={ticket} />)
    });
    return (
      <table className='table table-striped'>
        <thead>
          <th>ID</th>
          <th>Subject</th>
          <th>Spend</th>
        </thead>
        <tbody>
          {rows}
        </tbody>
      </table>
    )
  }
});

var Tickets = React.createClass({
  getInitialState: function() {
    return ({tickets: []})
  },
  componentDidMount: function() {
    rows = [];
    $.ajax({
      url: "https://support-api.heroku.com/views/fc928ccc-c182-4d95-b070-a3fcb57a8f27/tickets",
      headers: {
        "Authorization": "Bearer " + window.token,
        "Accept": "application/vnd.heroku+json; version=1"
      },
      success: function(tickets) {
        this.setState({tickets: tickets})
      }.bind(this)
    })
  },
  render: function() {
    return (
      <div className="col-xs-12">
        <TicketList tickets={this.state.tickets} />
      </div>
    )
  }
});

var Ticket = React.createClass({
  contextTypes: {
    router: React.PropTypes.func
  },
  getInitialState: function() {
    return ({
      ticket: {},
      requester: {}
    });
  },
  componentDidMount: function() {
    $.ajax({
      url: "https://support-api.heroku.com/tickets/" + this.context.router.getCurrentParams().ticketId,
      headers: {
        "Authorization": "Bearer " + window.token,
        "Accept": "application/vnd.heroku+json; version=1"
      },
      success: function(ticket) {
        this.setState({
          ticket: ticket,
          requester: ticket.requester
        });
      }.bind(this)
    })
  },
  render: function() {
    return (
      <div className="col-xs-12">
        <Link to="tickets">Back to Support View</Link>
        <h2>#{this.state.ticket.id} - {this.state.ticket.subject}</h2>
        <TicketRequester requester={this.state.requester} />
        <Comments ticketId={this.context.router.getCurrentParams().ticketId} />
      </div>
    )
  }
});

var TicketRequester = React.createClass({
  render: function() {
    if (this.props.requester.full_name != undefined) {
      str = this.props.requester.full_name + " (" + this.props.requester.email + ")"
    } else {
      str = this.props.requester.email
    }
    return (
      <p>
        Requested by: {str}
      </p>
    )
  }
});

var routes = (
  <Route handler={App} path="/">
    <Route name="tickets" path="/" handler={Tickets}/>
    <Route name="ticket" path=":ticketId" handler={Ticket}/>
    <DefaultRoute handler={Tickets}/>
  </Route>
);

Router.run(routes, function (Handler) {
  React.render(<Handler />, document.getElementById('container'));
});
