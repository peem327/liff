import { userService } from './user.service';

export function handleResponse(response: any) {
    return response.text().then(async(text: any) => {
        try{
            let data = text && JSON.parse(text);

            if (!response.ok) {
                if (response.status === 401) {
                    if(data.error && data.error.length && (data.error[0].code === 'error_permission' || data.error[0].code === 'error_login') ) {
                      localStorage.removeItem(process.env.VUE_APP_LOCAL_STORAGE_KEY);
                      localStorage.removeItem(process.env.VUE_APP_ACCESS_API_STORAGE_KEY);
                      localStorage.removeItem(process.env.VUE_APP_STORE_LOCAL_STORAGE_KEY);
                      location.href = '/';
                    }
                    // auto logout if 401 response returned from api
                    return await userService.getAccessToken();
                    //location.reload(true);
                }
                const error = (data && data.message) || response.statusText;
                return Promise.reject(data);
            }
            return data;
        }catch(e){
            console.log('Error: ', e);
            throw e;
        }
    });
}
