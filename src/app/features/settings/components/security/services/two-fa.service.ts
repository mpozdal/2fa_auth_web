import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../../../../../api.constants';
import {
  Enable2FAResponse,
  ServiceResult,
  SetupResponse,
} from '../../../../../shared/models/app.types';

@Injectable({
  providedIn: 'root',
})
export class TwoFAService {
  private readonly httpClient = inject(HttpClient);

  public setup(): Observable<SetupResponse> {
    return this.httpClient
      .post<ServiceResult<SetupResponse>>(API_ENDPOINTS.TWO_FA.SETUP, {})
      .pipe(map((res) => res.value as SetupResponse));
  }

  public disable(): Observable<any> {
    return this.httpClient.delete<any>(API_ENDPOINTS.TWO_FA.DISABLE);
  }

  public enable(code: string): Observable<Enable2FAResponse> {
    return this.httpClient
      .post<ServiceResult<Enable2FAResponse>>(API_ENDPOINTS.TWO_FA.ENABLE, {
        code,
      })
      .pipe(map((res) => res.value as Enable2FAResponse));
  }
}
