import {IFileChangedCallback, ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';
import {IDiagram, ISolution} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerRepository} from '@process-engine/solutionexplorer.repository.contracts';
import {IIdentity} from '@essential-projects/iam_contracts';
import {BadRequestError} from '@essential-projects/errors_ts';

export class SolutionExplorerService implements ISolutionExplorerService {

  private readonly repository: ISolutionExplorerRepository;
  private pathspec: string;

  constructor(repository: ISolutionExplorerRepository) {
    this.repository = repository;
  }

  public watchFile(filepath: string, callback: IFileChangedCallback): void {
    this.repository.watchFile(filepath, callback);
  }

  public unwatchFile(filepath: string): void {
    this.repository.unwatchFile(filepath);
  }

  public async openSolution(pathspec: string, identity: IIdentity): Promise<void> {
    //  Cleanup name if '/' at the end {{{ //

    /**
     * TODO: This needs to be refactored and moved to the
     * different repositories.
     */
    const pathIsNotRootOnly = pathspec !== '/';
    const pathEndsWithSlash = pathspec.endsWith('/');
    const trailingSlashShouldBeRemoved = pathIsNotRootOnly && pathEndsWithSlash;

    this.pathspec = trailingSlashShouldBeRemoved
      ? pathspec.slice(0, -1)
      : pathspec;

    //  }}} Cleanup name if '/' at the end //<

    await this.repository.openPath(this.pathspec, identity);
  }

  public async loadSolution(): Promise<ISolution> {
    const diagrams: Array<IDiagram> = await this.repository.getDiagrams();

    const pathspec = this.pathspec;
    const name = pathspec.substring(pathspec.lastIndexOf('/') + 1);
    const uri = pathspec;

    return {
      name: name,
      uri: uri,
      diagrams: diagrams,
    };
  }

  public async saveSolution(solution: ISolution, path?: string): Promise<void> {

    const solutionPathDosentMatchCurrentPathSpec = solution.uri !== this.pathspec;

    if (solutionPathDosentMatchCurrentPathSpec) {
      throw new BadRequestError(`'${solution.uri}' dosent match opened pathspec '${this.pathspec}'.`);
    }

    await this.repository.saveSolution(solution, path);
  }

  public loadDiagram(diagramName: string, pathspec?: string): Promise<IDiagram> {
    return this.repository.getDiagramByName(diagramName, pathspec);
  }

  public saveDiagram(diagram: IDiagram, pathspec?: string): Promise<void> {
    return this.repository.saveDiagram(diagram, pathspec);
  }

  public renameDiagram(diagram: IDiagram, newName: string): Promise<IDiagram> {
    return this.repository.renameDiagram(diagram, newName);
  }

  public deleteDiagram(diagram: IDiagram): Promise<void> {
    return this.repository.deleteDiagram(diagram);
  }

}
