import { logOut } from "../../../auth";
import { useRouter } from "next/navigation";

export default function UserSettingsWidget({ setShowProfileWidget }) {
    const router = useRouter();

    const handleLogOut = () => {
        router.push('/login');
        setShowProfileWidget(false);
        logOut();
    }

    return (
        <div className="flex flex-col absolute top-[32px] w-36 right-0 bg-bg_blue1 p-4 border-b-2 border-l-2 border-r-2 border-bg_blue2 
            origin-top animate-grow-height overflow-hidden">
            <a className="hover:text-bg_teal2 transition 250 cursor-pointer" href="/profile">User Settings</a>
            <a className="hover:text-bg_teal2 transition 250 cursor-pointer" onClick={handleLogOut}>Log Out</a>
        </div>
    )
}