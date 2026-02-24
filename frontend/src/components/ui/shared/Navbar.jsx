import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User2, LogOut } from "lucide-react";

const Navbar = () => {
  const user = null; // replace with real auth state
  return (
    <div className="bg-white">
      <div className="flex items-center justify-between h-16 mx-auto max-w-7xl">
        <div>
          <h1 className="text-xl font-bold">
            Job<span className="text-[#F83002]">Portal</span>
          </h1>
        </div>
        <div className="flex items-center gap-12">
          <ul className="flex items-center gap-5 font-medium">
            {/* <li><Link>Home</Link></li>
                    <li><Link>Jobs</Link></li>
                    <li><Link>Browse</Link></li> */}
            <li>Home</li>
            <li>Jobs</li>
            <li>Browse</li>
          </ul>
          {!user ? (
            <div className="flex items-center gap-2">
              <Button variant="outline">Login</Button>
              <Button>Signup</Button>
            </div>
          ) : null}
          <Popover>
            <PopoverTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage
                  src="https://github.com/shadcn.png"
                  alt="@shadcn"
                  className="grayscale"
                />
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-88">
              <div className="flex gap-2 space-y-2">
                <Avatar className="cursor-pointer">
                  <AvatarImage
                    src="https://github.com/shadcn.png"
                    alt="@shadcn"
                    className="grayscale"
                  />
                </Avatar>
                <div>
                  <h4 className="font-medium">Samreen Jahan</h4>
                  <p className="text-sm text-muted-foreground">
                    Lorem, ipsum dolor sit ametknga.
                  </p>
                </div>
              </div>

              <div className="flex flex-col text-gray-600">
                <div className="flex items-center gap-2 cursor-pointer w-fit">
                    <User2/>
                    <Button variant="link">View Profile</Button>
                </div>
                <div className="flex items-center gap-2 cursor-pointer w-fit">
                    <LogOut/>
                    <Button variant="link">Logout</Button>
                </div>
                
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </div>
  );
};
export default Navbar;
