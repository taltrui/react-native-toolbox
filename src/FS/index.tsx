import {
  CameraOptions,
  ImagePickerResponse,
  Asset,
  ErrorCode,
  launchImageLibrary,
} from 'react-native-image-picker';
import DocumentPicker, {
  DocumentPickerOptions,
  DocumentPickerResponse,
} from 'react-native-document-picker';
import type { FILE_TYPES_TYPE } from './fileTypes';

export interface FSType {
  /**
   * Opens device's image library.
   *
   * @param successCallback - Function which will recieve an array of assets in case of success.
   * Refer to {@link https://github.com/react-native-image-picker/react-native-image-picker#asset-object} to see each asset body
   * @param errorCallback - Function which will recieve an error in case of failure.
   * Refer to {@link https://github.com/react-native-image-picker/react-native-image-picker#errorcode} to see possible error codes
   * @param options - Optional. Options to customize behaviour. See: {@link https://github.com/react-native-image-picker/react-native-image-picker#options}
   *
   * @see For multiple selection you can use the `selectionLimit` option with value 0. `{ selectionLimit: 0 }`
   * @returns void
   *
   */
  openImageLibrary: (
    successCallback: SuccessCallback,
    errorCallback: ErrorCallback,
    options?: CameraOptions
  ) => void;

  /**
   * Opens device's file picker to pick only one file.
   *
   * @param successCallback - Function which will recieve an array with the selected file in case of success.
   * Refer to {@link https://github.com/rnmods/react-native-document-picker#result} to see the file body
   * @param errorCallback - Function which will recieve an error in case of failure.
   * @param allowedTypes - Optional. Allowed types to pick, defaults to all types.
   * @param options - Optional. Options to customize behaviour. See: {@link https://github.com/rnmods/react-native-document-picker#options}
   *
   * @see allowMultiSelection is false and cannot be overriden.
   * @returns void
   *
   */
  openSingleFilePicker: (
    successCallback: SuccessCallback,
    errorCallback: ErrorCallback,
    allowedTypes?: string | string[] | undefined,
    options?: DocumentPickerOptions<'android' | 'ios'>
  ) => Promise<void>;

  /**
   * Opens device's file picker to pick multiple files.
   *
   * @param successCallback - Function which will recieve an array of selected files in case of success.
   * Refer to {@link https://github.com/rnmods/react-native-document-picker#result} to see each file body
   * @param errorCallback - Function which will recieve an error in case of failure.
   * @param allowedTypes - Optional. Allowed types to pick, defaults to all types.
   * @param options - Optional. Options to customize behaviour. See: {@link https://github.com/rnmods/react-native-document-picker#options}
   *
   * @see allowMultiSelection is true and cannot be overriden.
   * @returns void
   *
   */
  openMultipleFilePicker: (
    successCallback: SuccessCallback,
    errorCallback: ErrorCallback,
    allowedTypes?: string | string[] | undefined,
    options?: DocumentPickerOptions<'android' | 'ios'>
  ) => Promise<void>;

  FILE_TYPES: FILE_TYPES_TYPE;

  /**
   * Upload the desire files.
   *
   * @param files - Files to upload, must be an array where each object body is: `{ data, uploadUrl }`.
   * Where `data` is the file data (like type, uri, etc.).
   * @param strict - Optional - When true it will lazily fail if any upload failed. When false it will finish all uploads and return those who failed.
   * defaults to true.
   *
   * @returns An object with the result of the upload.
   *
   */
  uploadFiles: (
    files: FileToUpload[],
    strict?: Boolean
  ) => Promise<UploadFileResponse>;
}

export type SuccessCallback = (assets: Asset[] | undefined) => void;

export type ErrorCallback = (
  error: ErrorCode,
  message?: string | undefined
) => void;

export type FileToUpload = {
  data: Asset & DocumentPickerResponse;
  uploadUrl: string;
};

export type UploadFileResponse = {
  status: string;
  ok: Boolean;
  error?: string;
  failedUploads?: PromiseSettledResult<Response>[];
};

const FILE_TYPES = DocumentPicker.types;

const determineFileOrImage = (fileType: string): string =>
  fileType.includes('image') ? 'image' : 'file';

const uploadFiles = async (
  files: FileToUpload[],
  strict: Boolean = true
): Promise<UploadFileResponse> => {
  const promises = files.map((file) => {
    const data = new FormData();

    data.append(determineFileOrImage(file.data.type), {
      uri: file.data.uri,
      type: file.data.type,
      name: file.data.fileName || file.data.name,
    });

    return fetch(file.uploadUrl, {
      method: 'POST',
      body: data,
    });
  });

  if (strict) {
    try {
      await Promise.all(promises);
      return { status: 'ALL_FILES_UPLOADED', ok: true };
    } catch (error) {
      return { status: 'AN_UPLOAD_FAILED', ok: false, error };
    }
  } else {
    const resolves = await Promise.allSettled(promises);

    const rejecteds = resolves.filter(
      (resolve) => resolve.status === 'rejected'
    );

    if (rejecteds.length === resolves.length) {
      return {
        status: 'ONE_OR_MORE_UPLOADS_FAILED',
        ok: false,
        failedUploads: rejecteds,
      };
    }
    return {
      status: 'ONE_OR_MORE_UPLOADS_FAILED',
      ok: true,
      failedUploads: rejecteds,
    };
  }
};
const handleImageLibraryResponse =
  (success: SuccessCallback, failure: ErrorCallback) =>
  (response: ImagePickerResponse) => {
    const { assets, didCancel, errorCode, errorMessage } = response;

    if (didCancel) return;

    if (errorCode) failure(errorCode, errorMessage);

    success(assets);
  };

const handleFilePickerPromise = async (
  promise: Promise<DocumentPickerResponse[]>,
  success: SuccessCallback,
  failure: ErrorCallback
): Promise<void> => {
  try {
    const result = await promise;

    success(result);
  } catch (error) {
    if (DocumentPicker.isCancel(error)) {
      return;
    } else {
      failure(error);
    }
  }
};

const openImageLibrary = (
  successCallback: SuccessCallback,
  errorCallback: ErrorCallback,
  options: CameraOptions
): void => {
  launchImageLibrary(
    options,
    handleImageLibraryResponse(successCallback, errorCallback)
  );
};

const openSingleFilePicker = (
  successCallback: SuccessCallback,
  errorCallback: ErrorCallback,
  allowedTypes: string | string[] | undefined,
  options: DocumentPickerOptions<'android' | 'ios'>
): Promise<void> =>
  handleFilePickerPromise(
    DocumentPicker.pick({
      ...options,
      allowMultiSelection: false,
      type: allowedTypes || DocumentPicker.types.allFiles,
    }),
    successCallback,
    errorCallback
  );

const openMultipleFilePicker = (
  successCallback: SuccessCallback,
  errorCallback: ErrorCallback,
  allowedTypes: string | string[] | undefined,
  options: DocumentPickerOptions<'android' | 'ios'>
): Promise<void> =>
  handleFilePickerPromise(
    DocumentPicker.pick({
      ...options,
      allowMultiSelection: true,
      type: allowedTypes || DocumentPicker.types.allFiles,
    }),
    successCallback,
    errorCallback
  );

export default {
  openImageLibrary,
  openSingleFilePicker,
  openMultipleFilePicker,
  FILE_TYPES,
  uploadFiles,
} as FSType;
