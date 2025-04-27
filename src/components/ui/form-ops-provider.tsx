"use client";

import React, { useState } from "react";

type FormOpsProviderProperties = {
  pendingImageUpload: boolean;
  setPendingImageUpload: (isInProgress: boolean) => void;
  setVideoUploadPercentage: (percentage: number) => void;
  uploadInProgress: boolean;
  videoUploadPercentage: number;
};

const FormOpsContext = React.createContext<FormOpsProviderProperties>({
  pendingImageUpload: false,
  setPendingImageUpload: () => ({}),
  setVideoUploadPercentage: () => ({}),
  uploadInProgress: false,
  videoUploadPercentage: -1,
});

export const useFormOps = () => React.useContext(FormOpsContext);

export function FormOpsProvider({ children }: { children: React.ReactNode }) {
  const [videoUploadPercentage, setVideoUploadPercentage] = useState(-1);
  const [pendingImageUpload, setPendingImageUpload] = useState(false);

  return (
    <FormOpsContext.Provider
      value={{
        pendingImageUpload,
        setPendingImageUpload,
        setVideoUploadPercentage,
        uploadInProgress: pendingImageUpload || videoUploadPercentage !== -1,
        videoUploadPercentage,
      }}
    >
      {children}
    </FormOpsContext.Provider>
  );
}
