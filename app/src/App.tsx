import React from 'react'
import { Normalize } from 'styled-normalize'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom'
import NotConnectedPage from 'pages/NotConnectedPage'

const App: React.FC = () => {
  return (
    <>
      <Normalize />
      <Router>
        <Switch>
          <Route path="/" exact={true} component={NotConnectedPage} />
        </Switch>
      </Router>
    </>
  )
}

export default App
