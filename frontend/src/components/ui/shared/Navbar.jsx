import React from "react";
import {Link} from "react-router-dom";

const Navbar = () =>{
    return(
        <div className='bg-white'>
            <div className='flex items-center justify-between mx-auto'>
            <div>
                <h1 className='text-xl font-bold'>Job<span className='text-[#F83002]'>Portal</span></h1>
            </div>
            <div>
                <ul className='flex font-medium items-center gap-5'>
                    {/* <li><Link>Home</Link></li>
                    <li><Link>Jobs</Link></li>
                    <li><Link>Browse</Link></li> */}
                    <li>Home</li>
                    <li>Jobs</li>
                    <li>Browse</li>
                </ul>
            </div>
            </div>
        </div>
    )
}
export default Navbar;