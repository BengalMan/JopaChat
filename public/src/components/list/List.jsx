import ChatList from './chatList/ChatList'
import './list.css'
import UserInfo from './userInfo/UserInfo'
import MatchScreen from '../waiting/MatchScreen'

const List = () => {


    return (
        <div className="list">
            <UserInfo />
            <ChatList />
            {/* <MatchScreen /> */}
        </div>
    )
}

export default List