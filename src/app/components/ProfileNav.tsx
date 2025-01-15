import { useState } from "react"

export default function ProfileNav({ setSelectedTab }) {
    return (
        <div className="flex flex-row bg-bg_blue2 m-auto items-center" style={{ width: '1024px' }}>
            <ul className="flex flex-row text-md">
                <li className="hover:bg-bg_blue1 px-4 py-2 cursor-pointer" onClick={() => setSelectedTab(0)}>All</li>
                <li className="hover:bg-bg_blue1 px-4 py-2 cursor-pointer" onClick={() => setSelectedTab(1)}>Songs</li>
                <li className="hover:bg-bg_blue1 px-4 py-2 cursor-pointer" onClick={() => setSelectedTab(2)}>Likes</li>
                <li className="hover:bg-bg_blue1 px-4 py-2 cursor-pointer" onClick={() => setSelectedTab(3)}>Reposts</li>
            </ul>
        </div>
    )
}