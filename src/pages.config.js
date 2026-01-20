import Contacts from './pages/Contacts';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Contacts": Contacts,
    "Dashboard": Dashboard,
    "Messages": Messages,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};