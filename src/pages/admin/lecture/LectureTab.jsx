import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { useEditLectureMutation, useGetLectureByIdQuery, useRemoveLectureMutation } from "@/features/api/courseApi";
import axios from "axios";
import { Loader2 } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";

import { MEDIA_API } from "@/lib/api";

const LectureTab = () => {
  const [lectureTitle, setLectureTitle] = useState("");
  const [uploadVideoInfo, setUploadVideoInfo] = useState(null);
  const [isFree, setIsFree] = useState(false);
  const [mediaProgress, setMediaProgress] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [btnDisable, setBtnDisable] = useState(true);
  const [isUploadComplete, setIsUploadComplete] = useState(false);
  const params = useParams();
  const { courseId, lectureId } = params;

  const {data:lectureData} = useGetLectureByIdQuery(lectureId);
  const lecture = lectureData?.lecture;

  useEffect(()=>{
    if(lecture){
      setLectureTitle(lecture.lectureTitle);
      setIsFree(lecture.isPreviewFree);
      // Only set uploaded video info if we have a valid video URL from database
      if(lecture.videoUrl) {
        setUploadVideoInfo({
          videoUrl: lecture.videoUrl,
          publicId: lecture.publicId
        })
      }
    }
  },[lecture])

  const [edtiLecture, { data, isLoading, error, isSuccess }] =
    useEditLectureMutation();
    const [removeLecture,{data:removeData, isLoading:removeLoading, isSuccess:removeSuccess}] = useRemoveLectureMutation();

  const fileChangeHandler = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      setMediaProgress(true);
      setIsUploadComplete(false);
      try {
        const res = await axios.post(`${MEDIA_API}/upload-video`, formData, {
          onUploadProgress: ({ loaded, total }) => {
            setUploadProgress(Math.round((loaded * 100) / total));
          },
        });

        if (res.data.success) {
          console.log("Upload response:", res.data);
          // Cloudinary returns secure_url not url
          const videoUrl = res.data.data.secure_url || res.data.data.url;
          const publicId = res.data.data.public_id;
          
          console.log("Setting videoUrl:", videoUrl);
          console.log("Setting publicId:", publicId);
          
          setUploadVideoInfo({
            videoUrl: videoUrl,
            publicId: publicId,
          });
          setBtnDisable(false);
          setIsUploadComplete(true);
          toast.success(res.data.message);
        }
      } catch (error) {
        console.log("Upload error:", error);
        toast.error("video upload failed");
      } finally {
        setMediaProgress(false);
      }
    }
  };

  const editLectureHandler = async () => {
    console.log({ lectureTitle, uploadVideoInfo, isFree, courseId, lectureId });
    
    // Validate that video info is set and upload is complete
    if (!uploadVideoInfo || !uploadVideoInfo.videoUrl) {
      toast.error("Please upload a video first");
      return;
    }
    
    if (mediaProgress) {
      toast.error("Video is still uploading. Please wait for it to complete.");
      return;
    }

    await edtiLecture({
      lectureTitle,
      videoInfo: uploadVideoInfo,
      isPreviewFree: isFree,
      courseId,
      lectureId,
    });
  };

  const removeLectureHandler = async () => {
    await removeLecture(lectureId);
  }

  useEffect(() => {
    if (isSuccess) {
      toast.success(data.message);
    }
    if (error) {
      toast.error(error.data.message);
    }
  }, [isSuccess, error]);

  useEffect(()=>{
    if(removeSuccess){
      toast.success(removeData.message);
    }
  },[removeSuccess])

  return (
    <Card>
      <CardHeader className="flex justify-between">
        <div>
          <CardTitle>Edit Lecture</CardTitle>
          <CardDescription>
            Make changes and click save when done.
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <Button disbaled={removeLoading} variant="destructive" onClick={removeLectureHandler}>
            {
              removeLoading ? <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
              Please wait
              </> : "Remove Lecture"
            }
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div>
          <Label>Title</Label>
          <Input
            value={lectureTitle}
            onChange={(e) => setLectureTitle(e.target.value)}
            type="text"
            placeholder="Ex. Introduction to Javascript"
          />
        </div>
        <div className="my-5">
          <Label>
            Video <span className="text-red-500">*</span>
          </Label>
          <Input
            type="file"
            accept="video/*"
            onChange={fileChangeHandler}
            placeholder="Ex. Introduction to Javascript"
            className="w-fit"
          />
        </div>
        <div className="flex items-center space-x-2 my-5">
          <Switch checked={isFree} onCheckedChange={setIsFree} id="airplane-mode" />
          <Label htmlFor="airplane-mode">Is this video FREE</Label>
        </div>

        {mediaProgress && (
          <div className="my-4">
            <Progress value={uploadProgress} />
            <p>{uploadProgress}% uploaded</p>
          </div>
        )}

        <div className="mt-4">
          <Button disabled={isLoading} onClick={editLectureHandler}>
              {
                isLoading ? <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin"/>
                Please wait
                </> : "Update Lecture"
              }
            
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LectureTab;
