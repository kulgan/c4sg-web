import {Injectable} from '@angular/core';
import {Http, Headers, Response, RequestOptions, URLSearchParams, Jsonp } from '@angular/http';
import 'rxjs/add/operator/toPromise';
import {Observable} from 'rxjs/Observable';
import {Project} from './project';
import {environment} from '../../../environments/environment';

const projectUrl = `${environment.backend_url}/api/projects`;


@Injectable()
export class ProjectService {

  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http) {
  }

  searchProjects(
    keyword?: string,
    skills?: string[],
    status?: string,
    remote?: string,
    page?: number,
    size?: number): Observable<any> {
    const params = new URLSearchParams();

    if (keyword) {
      params.append('keyWord', keyword);
    }

    if (skills) {
      for (let i = 0; i < skills.length; i++) {
        params.append('skills', skills[i]);
      }
    }

    if (status) {
      params.append('status', status);
    }

    if (remote) {
      params.append('remote', remote);
    }

    if (page) {
      params.append('page', String(page - 1));
    }

    if (size) {
      params.append('size', String(size));
    }

    return this.http
      .get(`${projectUrl}/search`, {search: params})
      .map( res => ({data: res.json().content, totalItems: res.json().totalElements}))
      .catch(this.handleError);
  }

  getProject(id: number): Observable<Project> {

    const url = projectUrl + '/' + id;

    return this.http.get(url)
      .map(res => res.json())
      .catch(this.handleError);
  }

  getProjectByOrg(id: number, projectStatus: string): Observable<Response> {
      if (projectStatus) {
        return this.http.get(`${projectUrl}/organization?organizationId=${id}&projectStatus=${projectStatus}`);
      } else {
        return this.http.get(`${projectUrl}/organization?organizationId=${id}`);
      }
  }

  getProjectByUser(id: number, userProjectStatus: string): Observable<Response> {
    return this.http.get(`${projectUrl}/user?userId=${id}&userProjectStatus=${userProjectStatus}`);
  }

  add(project: Project): Observable<{project: Project}> {
      return this.http.post(
      `${projectUrl}`,
      project
      ).map(res => res.json());
  }

  delete(id: number) {
    const url = projectUrl + '/' + id;
    return this.http
      .delete(url, {headers: this.headers})
      .catch(this.handleError);
  }

  update(project: Project) {
    // const url = projectUrl + '/' + project.id;
    // return this.http
    //  .put(url, project, {headers: this.headers})
    //  .map((res: Response) => res.json())
    //  .catch(this.handleError);

    return this.http.put(
      `${projectUrl}/${project.id}`,
      project
      );
  }

  linkUserProject(projectId: number, userId: string, status: string) {
    const url = projectUrl + '/' + projectId + '/users/' + userId + '?userProjectStatus=' + status;
    return this.http
      .post(url, {headers: this.headers})
      .catch(this.handleError);
  }

  private handleError(error: any): Promise<any> {
    console.error('An error occurred', error); // for demo purposes only
    return Promise.reject(error.message || error);
  }

  /*
    Http call to save the project image
  */
  saveProjectImg(id: number, imgUrl: string) {
    const requestOptions = new RequestOptions();
    requestOptions.search = new URLSearchParams(`imgUrl=${imgUrl}`);
    return this.http
      .put(`${projectUrl}/${id}/image`, '', requestOptions);
  }

  /*
  retrieveImage(id: number) {
    const url = projectUrl + '/' + id + '/image';
    return this.http
      .get(url);
  }

  add(project: Project): Observable<{project: Project}> {
    const url = projectUrl;
    return this.http
      .post(url, project, {headers: this.headers})
      .map((res: Response) => res.json())
      .catch(this.handleError);
  }

  getActiveProjects(): Observable<Project[]> {

    const url = projectUrl + '/search';

    return this.http.get(url)
      .map(res => res.json())
      .catch(this.handleError);
  }

  getProjects(): Observable<Project[]> {
    return this.http
      .get(projectUrl)
      .map(res => res.json())
      .catch(this.handleError);
  }
  */
}
