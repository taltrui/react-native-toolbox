import {
  CameraOptions,
  launchCamera,
  ImagePickerResponse,
  Asset,
  ErrorCode,
} from 'react-native-image-picker';

export interface CameraType {
  /**
   * Opens native device's camera.
   *
   * @param successCallback - Function which will recieve an array of assets in case of success.
   * Refer to {@link https://github.com/react-native-image-picker/react-native-image-picker#asset-object} to see each asset body
   * @param errorCallback - Function which will recieve the error in case of failure.
   * Refer to {@link https://github.com/react-native-image-picker/react-native-image-picker#errorcode} to see possible error codes
   * @param options - Optional. Options to customize behaviour. See: {@link https://github.com/react-native-image-picker/react-native-image-picker#options}
   *
   * @see For multiple selection you can use the `selectionLimit` option with value 0. `{ selectionLimit: 0 }`
   * @returns void
   *
   */
  open: (
    successCallback: SuccessCallback,
    errorCallback: ErrorCallback,
    options?: CameraOptions
  ) => void;
}

export type SuccessCallback = (assets: Asset[] | undefined) => void;

export type ErrorCallback = (
  error: ErrorCode,
  message: string | undefined
) => void;

const handleCameraResponse =
  (success: SuccessCallback, failure: ErrorCallback) =>
  (response: ImagePickerResponse) => {
    const { assets, didCancel, errorCode, errorMessage } = response;

    if (didCancel) return;

    if (errorCode) failure(errorCode, errorMessage);

    success(assets);
  };

const open = (
  successCallback: SuccessCallback,
  errorCallback: ErrorCallback,
  options: CameraOptions
): void => {
  launchCamera(options, handleCameraResponse(successCallback, errorCallback));
};

export default { open } as CameraType;
