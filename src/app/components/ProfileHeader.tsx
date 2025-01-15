/* eslint-disable @next/next/no-img-element */
export default function ProfileHeader({ userInfo }) {
    return (
        <div className="relative">
            <img src={userInfo.profileBanner} style={{width: '1024px', height: '192px'}} alt="profile banner" className="object-cover" />
            <div className="absolute bottom-8 left-8 flex flex-row" >
                <img
                    src={userInfo.profileImage}
                    className="w-32 h-32 rounded-full border-2 border-bg_blue1 object-cover"
                    alt="profile picture"
                />
                <h1 className="flex ml-4 text-center items-center bg-black/50 py-2 px-4 font-semibold text-2xl top-0 h-10 rounded object-cover">
                    {userInfo.username}
                </h1>
            </div>
        </div>
    )
}