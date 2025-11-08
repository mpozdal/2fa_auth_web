import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';
import { API_ENDPOINTS } from '../../../../../../api.constants';
import { ServiceResult } from '../../../../../shared/models/app.types';

export type UserInfo = {
  id: string;
  email: string;
  twoFactorEnabled: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly httpClient = inject(HttpClient);

  public getUserInfo(): Observable<UserInfo> {
    return this.httpClient
      .get<ServiceResult<UserInfo>>(API_ENDPOINTS.AUTH.USER_INFO)
      .pipe(map((res) => res.value as UserInfo));
  }
}
