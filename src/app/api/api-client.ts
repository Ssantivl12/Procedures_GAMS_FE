import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiClient {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  get<T>(path: string, params?: Record<string, string | number | boolean>) {
    return this.http.get<T>(this.baseUrl + path, {
      params: this.toParams(params),
    });
  }

  post<T>(path: string, body: unknown) {
    return this.http.post<T>(this.baseUrl + path, body);
  }

  put<T>(path: string, body: unknown) {
    return this.http.put<T>(this.baseUrl + path, body);
  }

  patch<T>(path: string, body: unknown) {
    return this.http.patch<T>(this.baseUrl + path, body);
  }

  delete<T>(path: string) {
    return this.http.delete<T>(this.baseUrl + path);
  }

  postFormData<T>(path: string, formData: FormData) {
    return this.http.post<T>(this.baseUrl + path, formData);
  }

  getBlob(path: string, params?: Record<string, string | number | boolean>) {
    return this.http.get(this.baseUrl + path, {
      params: this.toParams(params),
      responseType: 'blob',
    });
  }

  private toParams(params?: Record<string, string | number | boolean>): HttpParams | undefined {
    if (!params) return undefined;
    let httpParams = new HttpParams();
    for (const [k, v] of Object.entries(params)) {
      httpParams = httpParams.set(k, String(v));
    }
    return httpParams;
  }
}
