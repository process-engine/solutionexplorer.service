import {ISolutionExplorerService} from '@process-engine/solutionexplorer.service.contracts';
import {ISolution, IDiagram} from '@process-engine/solutionexplorer.contracts';
import {ISolutionExplorerRepository} from '@process-engine/solutionexplorer.repository.contracts';
import {IIdentity} from '@essential-projects/iam_contracts';
import {BadRequestError} from '@essential-projects/errors_ts';

export class SolutionExplorerService implements ISolutionExplorerService {

  private _repository: ISolutionExplorerRepository;
  private _pathspec: string;

  constructor(repository: ISolutionExplorerRepository) {
    this._repository = repository;
  }

  public watchFile(filepath: string, callback: (path: string) => void): void {
    this._repository.watchFile(filepath, callback);
  }

  public unwatchFile(filepath: string): void {
    this._repository.unwatchFile(filepath);
  }

  public async openSolution(pathspec: string, identity: IIdentity): Promise<void> {
    //  Cleanup name if '/' at the end {{{ //

    /**
     * TODO: This needs to be refactored and moved to the
     * different repositories.
     */
    const pathIsNotRootOnly: boolean = pathspec !== '/';
    const pathEndsWithSlash: boolean = pathspec.endsWith('/');
    const trailingSlashShouldBeRemoved: boolean = pathIsNotRootOnly && pathEndsWithSlash;

    this._pathspec = trailingSlashShouldBeRemoved
      ? pathspec.slice(0, -1)
      : pathspec;

    //  }}} Cleanup name if '/' at the end //<

    await this._repository.openPath(this._pathspec, identity);
  }

  public async loadSolution(): Promise<ISolution> {
    const diagrams: Array<IDiagram> =  await this._repository.getDiagrams();

    const pathspec = this._pathspec;
    const name: string = pathspec.substring(pathspec.lastIndexOf('/')+1);
    const uri: string = pathspec;

    return {
      name: name,
      uri: uri,
      diagrams: diagrams,
    };
  }

  public async saveSolution(solution: ISolution, path?: string): Promise<void> {

    const solutionPathDosentMatchCurrentPathSpec: boolean = solution.uri !== this._pathspec;

    if (solutionPathDosentMatchCurrentPathSpec) {
      throw new BadRequestError(`'${solution.uri}' dosent match opened pathspec '${this._pathspec}'.`);
    }

    await this._repository.saveSolution(solution, path);
  }

  public loadDiagram(diagramName: string, pathspec?: string): Promise<IDiagram> {
    return this._repository.getDiagramByName(diagramName, pathspec);
  }

  public saveDiagram(diagram: IDiagram, pathspec?: string): Promise<void> {
    return this._repository.saveDiagram(diagram, pathspec);
  }

  public renameDiagram(diagram: IDiagram, newName: string): Promise<IDiagram> {
    return this._repository.renameDiagram(diagram, newName);
  }

  public deleteDiagram(diagram: IDiagram): Promise<void> {
    return this._repository.deleteDiagram(diagram);
  }
}
