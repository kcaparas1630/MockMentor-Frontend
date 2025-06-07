// Interface to track which media devices are available on the user's system
export interface MediaDeviceSupport {
    hasCamera: boolean;
    hasMicrophone: boolean;
    hasMediaDevicesAPI: boolean; // Browser support for accessing media devices
  }
