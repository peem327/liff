export function authHeader() {
	// return authorization header with jwt token
	let user = JSON.parse(localStorage.getItem(process.env.VUE_APP_LOCAL_STORAGE_KEY) as string);

	if (user && user.token) {
		return { 'Authorization': 'Bearer ' + user.token };
	} else {
		return {};
	}
}

export function clientAuthHeader(more?: any) {
	// return authorization header with jwt token
	const accessToken = localStorage.getItem(process.env.VUE_APP_ACCESS_API_STORAGE_KEY);
	let headers = new Headers();
	if (accessToken) {
		headers.append("Authorization", `Bearer ${accessToken}`);
	}
	if(more){
		Object.keys(more).forEach((k: any)=>{
			headers.append(k, more[k])
		})
	}
	return headers;
}

export function bahtFormatted(price: number, showSymbol?: boolean) {

	const formatter = new Intl.NumberFormat('th-TH', {
		style: 'currency',
		currency: 'THB',
		minimumFractionDigits: 0
	});
	if(showSymbol){
		return formatter.format(price);
	}
	return (formatter.format(price)+ ' บาท').replace('฿', '');
}

export function renderNumber(num: string) {
	return new Intl.NumberFormat().format(+num)
}

export function getQueryString(params: any): string {
    return Object.keys(params).map(k => {
        if (Array.isArray(params[k])) {
            return params[k]
            .map((val: string) => `${encodeURIComponent(k)}[]=${encodeURIComponent(val)}`)
            .join('&')
        }
        return `${encodeURIComponent(k)}=${(params[k])}`
    })
    .join('&')
}

export function getShortName(name: string) {
	let tmp = name.split(" ");
	const first = tmp[0].charAt(0);
	const last = tmp[tmp.length-1]? tmp[tmp.length-1].charAt(0): "";
	return first+last;
}

function initializeApp(){


}
export function initializeLiff(myLiffId: string) {
	const liff = window.liff;
	let token;
	return new Promise((resolve, reject)=>{
		liff
    .init({
        liffId: myLiffId
    })
    .then(async () => {
        // start to use LIFF's api
        //initializeApp();
				if (liff.isLoggedIn()) {
					console.log('liff logged in ');
				} else {
					console.log('liff not login ');
					await liff.login();
				}
				resolve(liff.getAccessToken());
    })
    .catch((err: any) => {
				console.log('liff error: ', err);
				// @ts-ignore
        if(document.getElementById("liffAppContent")) {
					// @ts-ignore
					document.getElementById("liffAppContent").classList.add('hidden');
				}
				// @ts-ignore
        if(document.getElementById("liffInitErrorMessage")) {
					// @ts-ignore
					document.getElementById("liffInitErrorMessage").classList.remove('hidden');
				}
				resolve('');
    });
	})
}
