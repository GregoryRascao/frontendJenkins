import {CrudConfig} from "./base-service";
import {Service, service} from "../../../framework/services/base-service";
import {HttpService} from "../../../framework/services/http-service";
import {User} from "../models/user-model";
import {environement} from "../../../env/environement";
import * as jwt from 'jsonwebtoken'
import {map, Observable, Subject} from "rxjs";
import {Router} from "../../../framework/routing/router";

const config: CrudConfig = {
    manyUrl: 'users',
    singleUrl: (id) => `users/${id}`
}

interface AuthResponse
{
    success: boolean;
    token: string;
}

interface DecodedToken
{
    user: User;
    iat: number;
    exp: number;
}

@service()
export class AuthService extends Service
{
    private authStatusSubject: Subject<User|null>;
    private user: User;
    private tokenExpiredTimeout: boolean;

    constructor(
        private http: HttpService,
        private router: Router
        ) {
        super();
        this.authStatusSubject = new Subject<User|null>();
        this.decodeToken();
        this.tokenExpiredTimeout = false;
    }

    get authStatusChanged()
    {
        return this.authStatusSubject.asObservable();
    }

    login(user: User)
    {
        return this.http.post<any>(`${environement.api}${config.manyUrl}/login`, user)
            .pipe(map((res: AuthResponse) =>
            {
                sessionStorage.setItem('token', res.token);
                const decoded = this.decodeToken();

                if(decoded)
                {
                    this.authStatusSubject.next(decoded.user);
                    return decoded.user;
                }

                return res;
            }));
    }

    logout()
    {
        console.log("LOGOUT");

        // @ts-ignore
        this.user = null;
        sessionStorage.removeItem('token');
        this.tokenExpiredTimeout = false;
        this.authStatusSubject.next(null);
        this.router.goToRoute('/');
    }

    private decodeToken()
    {
        const token = sessionStorage.getItem('token');
        let decoded = null;

        if(token)
        {
            decoded = jwt.decode(token) as DecodedToken;
            let expTime = (decoded.exp * 1000) - Date.now();
            if(!this.tokenExpiredTimeout && expTime > 0)
            {
                setTimeout(() =>
                {
                    this.logout();
                }, expTime);
                this.user = decoded.user;
            } else if(!this.tokenExpiredTimeout)
            {
                this.logout();
            }
        }
        return decoded;
    }

    getUser()
    {
        return this.user;
    }
}

