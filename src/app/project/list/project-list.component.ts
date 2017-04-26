import {Component, OnInit, OnDestroy} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';
import { Subscription } from 'rxjs/Rx';

import {Project} from '../common/project';
import {ProjectService} from '../common/project.service';
import { AuthService } from '../../auth.service';
import { OrganizationService } from '../../organization/common/organization.service';
import { User } from '../../user/common/user';

import { ImageDisplayService } from '../../_services/image-display.service';

@Component({
  selector: 'my-projects',
  templateUrl: 'project-list.component.html',
  styleUrls: ['project-list.component.scss']
})
export class ProjectListComponent implements OnInit, OnDestroy {

  p = 0;
  projects: Project[];
  users: User[];
  selectedProject: Project;
  pagedItems: any[]; // paged items
  pager: any = {}; // pager Object
  projectsSubscription: Subscription;
  userId: number;
  orgId: number;
  from: string;
  userProjectStatus = 'A';


  constructor(

     private projectService: ProjectService,
     private organizationService: OrganizationService,
     private router: Router,
     private auth: AuthService,
     private route: ActivatedRoute,
     private idService: ImageDisplayService
  ) { }

  ngOnInit(): void {
        const id = this.auth.getCurrentUserId();
        this.userId = +id;
        this.route.params.subscribe(
          params => this.from = params['from']);
        this.getProjects();
  }

   private getProjects(): void {
/* TODO the logic to be integrated
        if ((!this.auth.authenticated()) || (this.from === 'opportunities')) {
                 this.projectsSubscription = this.projectService.getProjects().subscribe(
                      res => this.projects = res,
                      error => console.log(error));

    }  else if ((this.auth.isVolunteer()) && (this.from === 'myProjects')) {
                  this.projectsSubscription = this.projectService.getProjectByUser(this.userId, this.userProjectStatus).subscribe(
                       res   => this.projects = JSON.parse(JSON.parse(JSON.stringify(res))._body),
                       error => console.log(error));

    }  else if ((this.auth.isOrganization()) && (this.from === 'myProjects')) {
                  this.organizationService.getUserOrganization(this.userId).subscribe(
                    response =>  {
                             this.users = JSON.parse(JSON.parse(JSON.stringify(response))._body);
                             this.users.forEach(
                               user => {
                                        this.orgId = user.id;
                                        this.projectsSubscription = this.projectService.getProjectByOrg(this.orgId).subscribe(
                                               res => this.projects = JSON.parse(JSON.parse(JSON.stringify(res))._body),
                                               error => console.log(error));
                                      });
                            },
                    error => console.log(error));
                   }
}
*/

     this.projectsSubscription = this.projectService
                                     .getProjects()
                                     .subscribe(
                                     res => {
                                       this.projects = res;
                                       res.forEach((e: Project) => {
                                        this.idService.displayImage(e.id,
                                          this.projectService.retrieveImage.bind(this.projectService))
                                          .subscribe(image => {
                                            e.image = image.url;
                                          });
                                       });
                                     },
                                       error => console.log(error)
                                     );

    /* TODO For logged in user, if they click Opportunities, they should see full list of project
       If they click My Projects, they should see filtered list of projecct for themselves.

    if(!this.auth.authenticated()){
         this.projectsSubscription = this.projectService.getProjects().subscribe(
              res => {
                this.projects = JSON.parse(JSON.parse(JSON.stringify(res))._body);
                this.setPage(1); // initialize to page 1
              },
              error => console.log(error));
        }

    else if (this.auth.isVolunteer()){
      this.projectsSubscription = this.projectService.getProjectByUser(this.userId).subscribe(
           res => {
             this.projects = JSON.parse(JSON.parse(JSON.stringify(res))._body);
             this.setPage(1); // initialize to page 1
           },
           error => console.log(error));
    }
    else if (this.auth.isOrganization()){
      this.projectsSubscription = this.projectService.getProjectByOrg(2).subscribe(
           res => {
             this.projects = JSON.parse(JSON.parse(JSON.stringify(res))._body);
             this.setPage(1); // initialize to page 1
           },
           error => console.log(error))
    }
    */
  }

  getProjectsByKeyword(keyword: string) {
    keyword = keyword.trim();
    if (!keyword) {
      return;
    }
    this.projectService
        .getProjectsByKeyword(keyword)
        .subscribe(
          res => this.projects = res,
          error => console.log(error)
        );
  }

  onSelect(project: Project): void {
    this.selectedProject = project;
    this.router.navigate(['/project/view', project.id]);
  }

  // TODO Don't provide the identity colume value
  add(name: string): void {
    name = name.trim();
    if (!name) {
      return;
    }

    const project = new Project(8, name, 1, 'description', 'logo.png', 'city', 'USA', '55311', 'Teens Give');

    this.projectService
        .add(project)
        .subscribe(
          response => {
            this.getProjects();
            this.router.navigate(['/nonprofits']);
          },
          error => console.log(error)
        );
  }

  delete(project: Project): void {
    this.projectService
        .delete(project.id)
        .subscribe(
          response => { // An error occurred SyntaxError: Unexpected end of JSON input
            this.getProjects();
            this.router.navigate(['/nonprofits']);
          },
          error => console.log(error)
        );
  }

  ngOnDestroy() {
    if (this.projectsSubscription) { this.projectsSubscription.unsubscribe(); }
  }

}
