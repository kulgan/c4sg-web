import { Component, OnInit, EventEmitter } from '@angular/core';
import { ActivatedRoute, Router, Params } from '@angular/router';
import { Location } from '@angular/common';
import { Project } from '../common/project';
import { Organization } from '../../organization/common/organization';
import { ProjectService } from '../common/project.service';
import { OrganizationService } from '../../organization/common/organization.service';
import { AuthService } from '../../auth.service';
import { SkillService} from '../../skill/common/skill.service';
import { MaterializeAction } from 'angular2-materialize';

@Component({
  selector: 'my-view-project',
  providers: [AuthService],
  templateUrl: 'project-view.component.html',
  styleUrls: ['project-view.component.scss']
})

export class ProjectViewComponent implements OnInit {

  organization: Organization;
  project: Project;
  projects: Project[];
  numberOfProjects: number;
  params: Params;
  currentUserId: string;
  globalActions = new EventEmitter<string|MaterializeAction>();
  deleteGlobalActions = new EventEmitter<string|MaterializeAction>();
  userProjectStatus: string;
  projectStatusApplied = false;
  projectStatusBookmarked = false;
  auth: AuthService;
  defaultImage = '../../assets/default_image.png';
  categoryName: string;

  modalActions = new EventEmitter<string|MaterializeAction>();

  displayShare = true;
  displayApply = false;
  displayBookmark = false;
  displayEdit = false;
  displayDelete = false;

  constructor(private projectService: ProjectService,
              private organizationService: OrganizationService,
              private skillService: SkillService,
              private route: ActivatedRoute,
              private router: Router,
              public authService: AuthService,
              private location: Location) {
  }

  ngOnInit(): void {

    this.auth = this.authService;

    this.route.params.subscribe(params => {
      const id = params['projectId'];

      this.projectService.getProject(id)
      .subscribe(
          res => {
            this.project = res;

            // Organization for this project
            this.organizationService.getOrganization(res.organizationId)
                .subscribe(
                    resi => {
                      this.organization = resi;

                      // Validation rules should force websiteUrl to start with http but add check just in case
                      if (this.organization.websiteUrl && this.organization.websiteUrl.indexOf('http') !== 0) {
                        this.organization.websiteUrl = `http://${this.organization.websiteUrl}`;
                      }

                      if (this.organization.description != null && this.organization.description.length > 100) {
                          this.organization.description = this.organization.description.slice(0, 100) + '...';
                      }

                      this.setCategoryName();
                    }
                    );

            // Projects for this organization
            this.projectService.getProjectByOrg(res.organizationId, 'A')
                  .subscribe(
                    resProjects => {
                      this.projects = resProjects.json();
                      this.projects.forEach((e: Project) => {
                        this.skillService.getSkillsByProject(e.id).subscribe(
                          response => {
                            e.skills = response;
                          });
                      });
                    },
                      errorProjects => console.log(errorProjects)
                  );

            this.skillService.getSkillsByProject(id)
              .subscribe(
                result => {
                  this.project.skills = result;
                }
              );

            this.displayButtons();

          },
          error => console.log(error)
          );
    });
  }

  displayButtons(): void {

    if (!this.authService.authenticated()) {
      this.displayApply = true;
      this.displayBookmark = true;
    } else if (this.authService.authenticated()) {
      if (this.authService.isVolunteer()) {
        this.displayApply = true;
        this.displayBookmark = true;

        // Checks whether login user applied or bookmarked this project, to determine whether to disable Apply/Bookmark button
        this.currentUserId = this.authService.getCurrentUserId();

        this.projectService.getProjectByUser(Number(this.currentUserId), 'A')
          .subscribe(
            resProjects => {
              this.projects = resProjects.json();
              this.projects.forEach((e: Project) => {
                if (e.id === this.project.id) {
                  this.projectStatusApplied = true;
                }
              });
            },
              errorProjects => console.log(errorProjects)
        );

        this.projectService.getProjectByUser(Number(this.currentUserId), 'B')
          .subscribe(
            resProjects => {
              this.projects = resProjects.json();
              this.projects.forEach((e: Project) => {
                if (e.id === this.project.id) {
                  this.projectStatusBookmarked = true;
                }
              });
            },
              errorProjects => console.log(errorProjects)
        );
      } else if (this.authService.isOrganization()) {
        this.organizationService.getUserOrganization(Number(this.authService.getCurrentUserId())).subscribe(
          res => {
            let organization: Organization;
            organization = res[0];
            if ((organization !== undefined) && (organization.id === Number(this.project.organizationId))) {
              this.displayEdit = true;
              this.displayDelete = true;
            }
          },
          error => console.log(error)
        );
      } else if (this.authService.isAdmin()) {
        this.displayEdit = true;
        this.displayDelete = true;
      }
    }
  }

  apply(): void {
    this.userProjectStatus = 'A';
    this.currentUserId = this.authService.getCurrentUserId();
    if (this.authService.authenticated() && this.currentUserId !== null && this.currentUserId !== '0') {
        this.projectService
            .linkUserProject(this.project.id, this.currentUserId, this.userProjectStatus)
            .subscribe(
                response => {
                    // display toast
                    this.globalActions.emit({action: 'toast', params: ['Applied for the project', 4000]});
                    this.projectStatusApplied = true;
                },
                error => {
                    // display toast when bookmar is already added
                    this.globalActions.emit({action: 'toast', params: [JSON.parse(error._body).message, 4000]});
                }
            );
    } else {
        localStorage.setItem('redirectAfterLogin', this.router.url);
        this.authService.login();
    }
  }

  bookmark(): void {
    // check if user is logged in
    this.userProjectStatus = 'B';
    this.currentUserId = this.authService.getCurrentUserId();
    if (this.authService.authenticated() && this.currentUserId !== null && this.currentUserId !== '0') {
        this.projectService
            .linkUserProject(this.project.id, this.currentUserId, this.userProjectStatus)
            .subscribe(
                response => {
                    // display toast
                  this.globalActions.emit({action: 'toast', params: ['Bookmark added for the project', 4000]});
                  this.projectStatusBookmarked = true;
                },
                error => {
                    // display toast when bookmar is already added
                    this.globalActions.emit({action: 'toast', params: [JSON.parse(error._body).message, 4000]});
                }
            );
    } else {
        localStorage.setItem('redirectAfterLogin', this.router.url);
        this.authService.login();
    }
  }

  edit(): void {
    this.router.navigate(['project/edit', this.project.id]);
  }

  delete(): void {
    this.projectService
      .delete(this.project.id)
      .subscribe(
        response => {
          this.router.navigate(['project/list/projects']);
          this.deleteGlobalActions.emit({action: 'toast', params: ['Project deleted successfully', 4000]});
        },
        error => {
            console.log(error);
            this.deleteGlobalActions.emit({action: 'toast', params: ['Error while deleting a project', 4000]});
        }
      );
  }

  openModal(project) {
    this.modalActions.emit({action: 'modal', params: ['open']});
  }

  closeModal() {
    this.modalActions.emit({action: 'modal', params: ['close']});
  }

  setCategoryName(): void {
    if (this.organization.category === 'N') {
      this.categoryName = 'Nonprofit';
    } else if (this.organization.category === 'O') {
      this.categoryName = 'Open Source';
    } else if (this.organization.category === 'M') {
      this.categoryName = 'Misc';
    }
  }
}
