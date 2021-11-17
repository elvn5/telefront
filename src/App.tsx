import { useState } from 'react';
import Chats from './pages/Chats/Chats';
import Broadcast from './pages/Broadcast/Broadcast';
import LoginPage from './pages/LoginPage';
import NavBar from './NavBar';
import { BrowserRouter } from 'react-router-dom';
import { Switch, Route } from 'react-router';
import storage from './storage';
import api from './api/service';

function App() {
  const [token, setToken] = useState<string | undefined>(storage.get().token);

  const onLogOut = () => {
    storage.update({ token: undefined });
    setToken(undefined);
  }

  api.setUnauthorizedHandler(() => onLogOut());

  if (token) {
    return (
      <BrowserRouter>
        <NavBar onLogOut={onLogOut}/>
        <Switch>
          <Route path='/' exact={true}>
            <Chats/>
          </Route>
          <Route path='/broadcast'>
            <Broadcast/>
          </Route>
        </Switch>
      </BrowserRouter>
    );
  } else {
    return <LoginPage onTokenReceive={setToken}/>;
  }
}

export default App;
