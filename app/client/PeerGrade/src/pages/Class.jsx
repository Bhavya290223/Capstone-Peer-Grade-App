import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { CheckCircle, Clock, Trash2 } from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import Grades from "./classNav/Grades";
import Groups from "./classNav/Groups";
import Assignments from "./classNav/Assignments";
import People from "./classNav/People";
import Rubrics from "./classNav/Rubrics";
import AssignmentCreation from "../components/assign/assignment/AssignmentCreation";
import EditClass from "../components/class/EditClass";
import { useUser } from "@/contexts/contextHooks/useUser";
import { getAllAssignmentsByClassId } from "@/api/assignmentApi";
import { getCategoriesByClassId } from "@/api/classApi";
import { useToast } from "@/components/ui/use-toast";
import { useClass } from "@/contexts/contextHooks/useClass";
import CreateRubric from "../components/rubrics/CreateRubric";

const Class = () => {
  const { classId } = useParams();
  const [currentView, setCurrentView] = useState("home");
  const [assignments, setAssignments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [rubricCreated, setRubricCreated] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);

  const { toast } = useToast();
  const { user, userLoading } = useUser();
  const { classes } = useClass();

  const classItem = classes.find((classItem) => classItem.classId === classId);

  const fetchClassData = async () => {
    try {
      const [fetchedAssignments, fetchedCategories] = await Promise.all([
        getAllAssignmentsByClassId(classId),
        getCategoriesByClassId(classId)
      ]);
      setAssignments(fetchedAssignments.data);
      setCategories(fetchedCategories.data);
    } catch (error) {
      console.error("Failed to fetch class data", error);
      toast({
        title: "Error",
        description: "Failed to fetch class data",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (!userLoading && user) {
      fetchClassData();
    }
  }, [classId, user, userLoading, currentView]);

  useEffect(() => {
    if (rubricCreated && currentView === "rubrics") {
      fetchClassData();
      setRubricCreated(false);
    }
  }, [rubricCreated, currentView]);

  useEffect(() => {
	if (categories.length > 0 && openAccordion === null) {
	  setOpenAccordion(categories[0].categoryId);
	}
  }, [categories]);

  const handleViewChange = (view) => {
    setCurrentView(view);
    fetchClassData();
  };

  const handleRubricCreated = () => {
    setRubricCreated(true);
  };

  const handleDeleteCategory = (categoryId) => {
    console.log(`Deleting category with ID: ${categoryId}`);
    // Implement the actual deletion logic here
  };

  if (!classItem) {
    return <div>Class not found</div>;
  }

  const renderContent = () => {
    switch (currentView) {
      case "grades":
        return <Grades classAssignments={assignments} classId={classId} />;
      case "people":
        return <People classId={classId} />;
      case "groups":
        return <Groups classId={classId} />;
      case "assignments":
        return <Assignments classId={classId} />;
      case "assignmentCreation":
        return <AssignmentCreation onAssignmentCreated={() => {
          fetchClassData();
          handleViewChange("files");
        }} />;
      case "edit":
        return <EditClass classItem={classItem} />;
      case "rubrics":
        return <Rubrics key={rubricCreated} />;
      default:
        return (
          <>
            <Alert className="mb-6">
              <AlertTitle>Recent Announcements</AlertTitle>
              <AlertDescription>
                No recent announcements
              </AlertDescription>
            </Alert>
           <Accordion 
			type="single" 
			collapsible
			className="w-full bg-muted p-4 rounded-lg"
			value={openAccordion}
			onValueChange={(value) => setOpenAccordion(value)}
			>
			{categories.map((category) => (
				<AccordionItem value={category.categoryId} key={category.categoryId}>
                  <AccordionTrigger className="text-lg font-semibold">
                    <div className="flex justify-between w-full">
                      <span>{category.name}</span>
                      {(user?.role === "INSTRUCTOR" || user?.role === "ADMIN") && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="mx-2 bg-destructive/60">
                              <Trash2 className="h-4 w-4 text-priamry" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure you want to delete this category?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the category and all its contents.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDeleteCategory(category.categoryId)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {category.assignments.map((assignment) => (
                        <Link
                          key={assignment.assignmentId}
                          to={`/class/${classId}/assignment/${assignment.assignmentId}`}
                          className="block"
                        >
                          <Alert 
                            variant="default" 
                            className="hover:bg-accent cursor-pointer transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <AlertTitle className="text-base font-medium flex items-center gap-2">
                                  {assignment.title}
                                  {assignment.status === 'Completed' && <CheckCircle className="h-4 w-4 text-green-500" />}
                                </AlertTitle>
                                <AlertDescription className="text-sm text-muted-foreground mt-1">
                                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                                </AlertDescription>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm">
                                  <Clock className="h-4 w-4 mr-1" />
                                  Start
                                </Button>
                              </div>
                            </div>
                          </Alert>
                        </Link>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </>
        );
    }
  };
	
	  return (
		<div className="w-full px-6">
		  <div className="flex flex-col gap-1 mt-5 mb-6 rounded-lg">
			<h1 className="text-3xl font-bold">{classItem.classname}</h1>
			<span className="ml-1 text-sm text-gray-500 mb-2">
			  {classItem.description}
			</span>
	
			<Menubar className="flex gap-2">
					<MenubarMenu>
						<MenubarTrigger
							isActive={currentView === "home"}
							className="cursor-pointer"
							onClick={() => handleViewChange("home")}
						>
							Home
						</MenubarTrigger>
					</MenubarMenu>
					<MenubarMenu>
						<MenubarTrigger
							isActive={currentView === "assignments"}
							className="cursor-pointer"
							onClick={() => handleViewChange("assignments")}
						>
							Assignments
						</MenubarTrigger>
					</MenubarMenu>
					<MenubarMenu>
						<MenubarTrigger
							isActive={currentView === "grades"}
							className="cursor-pointer"
							onClick={() => handleViewChange("grades")}
						>
							Grades
						</MenubarTrigger>
					</MenubarMenu>
					<MenubarMenu>
						<MenubarTrigger
							isActive={currentView === "people"}
							className="cursor-pointer"
							onClick={() => handleViewChange("people")}
						>
							People
						</MenubarTrigger>
					</MenubarMenu>
					<MenubarMenu>
						<MenubarTrigger
							isActive={currentView === "groups"}
							className="cursor-pointer"
							onClick={() => handleViewChange("groups")}
						>
							Groups
						</MenubarTrigger>
					</MenubarMenu>
					{(user?.role === "INSTRUCTOR" || user?.role === "ADMIN") && (
						<MenubarMenu>
							<MenubarTrigger
								isActive={currentView === "edit"}
								className="cursor-pointer"
								onClick={() => handleViewChange("edit")}
							>
								Edit
							</MenubarTrigger>
						</MenubarMenu>
					)}
					{(user?.role === "INSTRUCTOR" || user?.role === "ADMIN") && (
						<MenubarMenu>
							<MenubarTrigger
								isActive={currentView === "rubrics"}
								className="cursor-pointer"
								onClick={() => handleViewChange("rubrics")}
							>
								Rubrics
							</MenubarTrigger>
						</MenubarMenu>
					)}
				</Menubar>
			</div>
			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2">{renderContent()}</div>
				<div className="space-y-3">
				{(user?.role === "INSTRUCTOR" || user?.role === "ADMIN") &&
					currentView !== "assignmentCreation" && (
					<>
					<Button
						variant="outline"
						onClick={() => handleViewChange("assignmentCreation")}
						className="w-full bg-white"
					>
						Create Assignment
					</Button>
					<Button
						variant="outline"
						onClick={() => {/* Implement add category logic */}}
						className="w-full bg-muted "
					>
						Add Category
					</Button>
					<CreateRubric 
						classId={classId} 
						assignments={assignments} 
						onRubricCreated={handleRubricCreated} 
						/>					
					</>
					)}
				<Card>
					<CardContent className="text-center py-6">
					<span className="block text-4xl font-bold">98%</span>
					<span className="text-gray-500">Class Grade</span>
					</CardContent>
				</Card>
				<Card>
					<CardContent className="text-center py-6">
					<span className="block text-4xl font-bold">98%</span>
					<span className="text-gray-500">Avg Peer Grade</span>
					</CardContent>
				</Card>
				<Card>
					<CardHeader>
					<CardTitle>To Do</CardTitle>
					</CardHeader>
					<CardContent>
					<Alert>
						<AlertDescription>No tasks due</AlertDescription>
					</Alert>
					</CardContent>
				</Card>
				</div>
			</div>
			</div>
		);
		};

		export default Class;
