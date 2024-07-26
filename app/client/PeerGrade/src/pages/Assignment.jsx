import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, FileText, Users, Edit, Upload, Download } from 'lucide-react';
import PDFViewer from '@/components/assign/PDFViewer';
import EditAssignment from '../components/assign/assignment/EditAssignment';
import Submissions from '../components/assign/assignment/Submissions';
import Submission from '../components/assign/assignment/StudentSubmission';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { getAssignmentInClass } from '@/api/assignmentApi';
import { toast } from "@/components/ui/use-toast";
import { useUser } from "@/contexts/contextHooks/useUser";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import ViewSubmissionDialog from '@/components/assign/assignment/submission/ViewSubmissionDialog';
import { getStudentSubmission, getStudentSubmissionForAssignment } from '@/api/submitApi';



const NonPDFFileDownload = ({ url, fileName }) => {
  const fileType = url.split('.').pop().toUpperCase();

  return (
    <div className="flex w-full flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
      <FileText className="w-16 h-16 mb-4 text-gray-400" />
      <p className="mb-2 text-sm text-gray-500">File type: {fileType}</p>
      <p className="mb-4 text-sm text-gray-500">Filename: {fileName}</p>
      <Button
        onClick={() => window.open(url, '_blank')}
        className="flex items-center"
      >
        <Download className="mr-2 h-4 w-4" />
        Download File
      </Button>
    </div>
  );
};


const Assignment = () => {
  const { user, userLoading } = useUser();
  const { classId, assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [refresh, setRefresh] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const fetchedAssignment = await getAssignmentInClass(classId, assignmentId);
        setAssignment(fetchedAssignment.data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch assignment data",
          variant: "destructive",
        });
      }
    };
    const fetchSubmissions = async () => {
      try {
        const fetchedSubmissions = await getStudentSubmissionForAssignment(user.userId, assignmentId);
        setSubmissions(fetchedSubmissions.data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
        console.log("subbys",submissions);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch submissions data",
          variant: "destructive",
        });
      }
    };

    fetchAssignment();
    if (user.role === 'STUDENT') {
      fetchSubmissions();
    }
  }, [user, userLoading, classId, assignmentId, refresh]);

  if (userLoading || !assignment) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  const handleBackClick = () => {
    navigate(`/class/${classId}`);
  };


  const handleDownload = (submission) => {
      const link = document.createElement("a");
      link.href = submission.submissionFilePath;
      link.download = `submission_${submission.submissionId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
  };

  const refreshToggle = () => {
    setRefresh(!refresh);
  };

  const isPDF = assignment?.assignmentFilePath?.toLowerCase().endsWith('.pdf') || false;


  return (
    <div className="container mx-auto px-4">
      <Card className="mb-8 bg-card">
        <CardHeader>
          <div className='flex w-full items-center justify-between'>
            <div className='flex items-center '>
              <div className="flex rounded-lg mr-2">
                <Button onClick={handleBackClick} variant='ghost' className='h-8 w-8'>
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </div>
              <div className='flex flex-col justify-center space-y-1'>
                <CardTitle className="text-2xl font-bold w-full">{assignment.title}</CardTitle>
                <CardDescription>{assignment.description}</CardDescription>
              </div>
            </div>
            <span className='text-md font-semibold'>Due Date: {new Date(assignment.dueDate).toLocaleDateString()}</span>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="view" className="space-y-4">
        {(user.role !== "STUDENT" || new Date(assignment.dueDate) >= new Date()) && <TabsList className="bg-muted">
          <TabsTrigger value="view">View Assignment</TabsTrigger>
          {user.role !== 'STUDENT' && <TabsTrigger value="edit">Edit Assignment</TabsTrigger>}
          {user.role !== 'STUDENT' && (
            <Link to={`/class/${classId}/assignment/${assignmentId}/submissions`} className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
              View Submissions
            </Link>
          )}
          {user.role === 'STUDENT' && <TabsTrigger value="submission">Submit Assignment</TabsTrigger>}
        </TabsList>}
        
        <TabsContent value="view">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className='rounded-md flex justify-center lg:col-span-2'>
            {assignment?.assignmentFilePath ? (
              isPDF ? (
                <PDFViewer url={assignment.assignmentFilePath} scale='0.93' />
              ) : (
                <NonPDFFileDownload 
                  url={assignment.assignmentFilePath} 
                  fileName={assignment.assignmentFilePath.split('/').pop()}
                />
              )
            ) : (
              <div className="flex items-center justify-center h-full">
                <p>No assignment file available</p>
              </div>
            )}
          </div>
            
            <div className="space-y-6">
            {user.role === "STUDENT" && 
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Submission Details:</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center space-x-2">
                    <span>Status:</span>
                    {submissions.length > 0 ?
                      <Badge variant='approved'>Submitted</Badge>
                      :
                      <div>
                        {new Date(assignment.dueDate) < new Date() ? <Badge variant="destructive">Missing</Badge> : <Badge variant="outline" className="bg-warning/30">Not Submitted</Badge> }
                      </div>
                    }
                  </div>
                  <Separator className="my-4" />
                  <div className="flex justify-between items-center space-x-2">
                    <span>Allowed File Types:</span>
                    <div className="flex flex-wrap justify-end">
                      {assignment.allowedFileTypes && assignment.allowedFileTypes.length > 0 ? (
                        assignment.allowedFileTypes.map((fileType, index) => (
                          <Badge key={index} variant="outline" className="ml-2 mb-2 bg-warning/30">
                            {fileType.toUpperCase()}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">No specific file types set</span>
                      )}
                    </div>
                  </div>
                  {submissions.length > 0 && 
                  <div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center space-x-2">
                      <span>Last Submitted On:</span>
                      <span className='text-end'>{new Date(submissions[0].createdAt).toLocaleString()}</span>
                    </div>
                    <Separator className="my-4" />
                    <div className="flex justify-between items-center space-x-2">
                      <span>Submissions:</span>
                      <div className='flex flex-col'>
                        {submissions.reverse().map((submission, index) => (
                            <Button onClick={() => {
                              setSelectedSubmission(submission);
                              setViewDialogOpen(true);
                            }} key={index} variant="ghost" className="flex items-center space-x-2">
                              <FileText className="h-5 w-5" />
                              <span>Submission {index + 1}</span>
                            </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  }
                </CardContent>
              </Card>
              }
              
              <Card className="bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Comments</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[200px]">
                    <p className="text-muted-foreground">No comments yet.</p>
                  </ScrollArea>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">Add Comment</Button>
                </CardFooter>
              </Card>
              
             
            </div>
          </div>
        </TabsContent>
        
        {user.role !== 'STUDENT' && (
          <>
            <TabsContent value="edit">
              <EditAssignment assignment={assignment} />
            </TabsContent>
            <TabsContent value="submissions">
              <Submissions assignmentId={assignmentId} />
            </TabsContent>
          </>
        )}
        
        {user.role === "STUDENT" && (
          <TabsContent value="submission">
            <Submission assignmentId={assignmentId} refresh={refreshToggle} />
          </TabsContent>
        )}
      </Tabs>
      <ViewSubmissionDialog
          submission={selectedSubmission}
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          onDownload={handleDownload}
      />
    </div>
  );
};

export default Assignment;

