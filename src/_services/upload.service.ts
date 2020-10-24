import { authHeader, clientAuthHeader } from '../_helpers';
import { IUser, IRegisterPayload } from '../_types';
import { handleResponse } from './response.middleware';

export default class UploadService {
    private API_URL = process.env.VUE_APP_API_URL;
    private AUTH_USER = process.env.VUE_APP_API_USER;
    private AUTH_PASSWORD = process.env.VUE_APP_API_PASSWORD;

    public attatchSlip(file: any) {
      const formData = new FormData();
      formData.append('image', file);
      const requestOptions: any = {
          method: 'POST',
          headers: clientAuthHeader(), //{"Content-Type":"multipart/form-data"}
          body: formData
      };
      return fetch(this.API_URL+`/v1/upload/image?type=slip`, requestOptions)
      .then(handleResponse)
      .then((result: any)=>{
          return result.data;
      })
    }
}

export const uploadService = new UploadService();
