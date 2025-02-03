import './userInfo.css';
import { useUserStore } from "../../../lib/userStore";

const UserInfo = () => {
    const { currentUser } = useUserStore();

    if (!currentUser) {
        return <div className="userInfo">Loading user...</div>; // Prevents crash during loading
    }

    return (
        <div className="userInfo">
            <div className='user'>
                <img src='./avatar.png' alt="User Avatar" />
                <h2>{currentUser?.username || "Unknown User"}</h2>
            </div>
            <div className='icons'>
                <img src='./more.png' alt="More Options" />
                <img src='./video.png' alt="Video Call" />
                <img src='./edit.png' alt="Edit Profile" />
            </div>
        </div>
    );
}

export default UserInfo;
