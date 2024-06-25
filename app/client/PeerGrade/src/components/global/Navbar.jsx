"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { useSelector } from 'react-redux';
import axios from 'axios';
import { cn } from "@/utils/utils";
import { useToast } from '@/components/ui/use-toast';
import { Link, useLocation, useNavigate } from "react-router-dom";
import { SearchIcon } from "lucide-react";
import NotifCard from "./NotifCard";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

export default function AppNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const [classesData, setClassesData] = useState([]);
  const [assignmentsData, setAssignmentsData] = useState([]);
  const { toast } = useToast();

  useEffect(() => {
    if (currentUser) {
      const fetchClasses = async () => {
        try {
          const response = await axios.post('/api/users/get-classes', { userId: currentUser.userId });
          console.log(response.data);
          setClassesData(Array.isArray(response.data) ? response.data : []);
          toast(classesData);
        } catch (error) {
          toast({ title: "Error", description: "Failed to fetch classes", variant: "destructive" });
        }
      };

      const fetchAssignments = async () => {
        try {
          const response = await axios.post('/api/users/get-assignments', { userId: currentUser.userId });
          setAssignmentsData(Array.isArray(response.data) ? response.data : []);
          toast(assignmentsData)
        } catch (error) {
          toast({ title: "Error", description: "Failed to fetch assignments", variant: "destructive" });
        }
      };

      fetchClasses();
      fetchAssignments();
    }
  }, [currentUser, toast]);

  if (!currentUser) {
    return null;
  }


  const [searchQuery, setSearchQuery] = React.useState(""); // State for search query

  const userReviewAssignments = assignmentsData
    .filter(assignment => {
      return Array.isArray(currentUser.classes) && currentUser.classes.includes(assignment.classId) && assignment.evaluation_type === 'peer';
    })
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

    const isActive = (path) => {
      return location.pathname === path || (path === '/dashboard' && location.pathname === '/');
    };
  const handleLogout = () => {
    navigate('/');
  };

  const search = () => {
    const trimmedQuery = searchQuery.trim();
    if (trimmedQuery) {
      navigate(`/search?query=${trimmedQuery}`);
    } else {
      navigate(`/search`);
    }
  };
  const getInitials = (firstName, lastName) => {
    const firstInitial = firstName ? firstName.charAt(0).toUpperCase() : '';
    const lastInitial = lastName ? lastName.charAt(0).toUpperCase() : '';
    return `${firstInitial}${lastInitial}`;
  };
  return (
    <div className="w-full py-3 px-4 bg-white shadow-md">
      <NavigationMenu className="flex items-center justify-between w-full max-w-screen-xl mx-auto">
        <NavigationMenuList className="flex space-x-2 sm:space-x-1">
          <NavigationMenuItem>
            <Link to="/dashboard">
              <img src="logo.png" className="w-10 h-10 sm:hidden md:block" alt="Logo"/>
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/dashboard" className={cn(navigationMenuTriggerStyle(), isActive('/dashboard') && 'font-bold')}>
              Dashboard
            </Link>
          </NavigationMenuItem>
          <NavigationMenuItem>
              <NavigationMenuTrigger onClick={() => navigate('/peer-review')} className={cn(navigationMenuTriggerStyle(), isActive('/peer-review') && 'font-bold')}>
                    Peer-Review
              </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="bg-white grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                {userReviewAssignments.map((assignment) => (
                  <ListItem
                    key={assignment.assignmentId}
                    title={assignment.title}
                    href={`/assignedPR/${assignment.assignmentId}`}
                  >
                    {assignment.description}
                  </ListItem>
                ))}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <NavigationMenuTrigger className={cn(navigationMenuTriggerStyle(), isActive('/classes') || isActive('/manageclasses') && 'font-bold')}>
              Classes
            </NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="bg-white grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                {classesData.map((classItem) => (
                  <ListItem
                    key={classItem.classId}
                    title={classItem.classname}
                    href={`/class/${classItem.classId}`}
                  >
                    {classItem.description}
                  </ListItem>
                ))}
                {(currentUser.role === 'INSTRUCTOR' || currentUser.role === 'ADMIN') && (
                  <ListItem
                    title="Manage Classes"
                    href="/manageclass"
                    className="bg-blue-100"
                  >
                    Administer classes and assignments.
                  </ListItem>
                )}
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
          <NavigationMenuItem>
            <Link to="/settings" className={cn(navigationMenuTriggerStyle(), isActive('/settings') && 'font-bold')}>
              Settings
            </Link>
          </NavigationMenuItem>
          {location.pathname !== '/search' && currentUser.role === 'ADMIN' && (
            <NavigationMenuItem>
              <div className="flex w-full max-w-sm items-center space-x-2">
                <Input 
                  placeholder="Search classes" 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} // Update state on input change
                  className="sm:hidden md:hidden lg:block"
                />
                <Button onClick={search} className='h-10 w-10'>
                  <SearchIcon className="w-5 h-5 sm:p-0 sm:m-0" />
                </Button>
              </div>
            </NavigationMenuItem>
          )}
        </NavigationMenuList>
        <div className="flex items-center space-x-4">
          <HoverCard>
            <HoverCardTrigger>
              <Avatar className="w-9 h-9 bg-gray-200 rounded-full shadow-md">
                <AvatarImage src={currentUser.avatarUrl} alt={`${currentUser.firstname} ${currentUser.lastname}`} />
                <AvatarFallback>{currentUser.firstname[0]}{currentUser.lastname[0]}</AvatarFallback>
              </Avatar>
            </HoverCardTrigger>
            <HoverCardContent className="w-full transform -translate-x-1/3">
              <div className="space-y-4">
                <div className="flex flex-col gap-1">
                  <NotifCard title="Admin: Heads up!" description="You have received a new message" />
                  <NotifCard title="Admin: Heads up!" description="You have received a new message" />
                  <NotifCard title="Admin: Heads up!" description="You have received a new message" />
                  <NotifCard title="Admin: Heads up!" description="You have received a new message" />                  
                  <Button variant="outline">View All</Button>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" size="sm" onClick={handleLogout}>
                    Logout
                  </Button>
                  <Link to="/settings">
                    <Button variant="outline" size="sm">
                      Visit Profile
                    </Button>
                  </Link>
                </div>
              </div>
            </HoverCardContent>
          </HoverCard>

        </div>
      </NavigationMenu>
    </div>
  );
}

const ListItem = React.forwardRef(
  ({ className, title, children, href, ...props }, ref) => {
    return (
      <li>
        <NavigationMenuLink asChild>
          <Link
            to={href}
            className={cn(
              "block shadow hover:shadow-lg select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
              className
            )}
            {...props}
          >
            <div className="text-sm font-medium leading-none">{title}</div>
            <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
              {children}
            </p>
          </Link>
        </NavigationMenuLink>
      </li>
    );
  }
);
ListItem.displayName = "ListItem";
