import { EntityManager } from 'typeorm';
import { IsolationLevel } from 'typeorm/driver/types/IsolationLevel';

export class Transactional {
  protected manager: EntityManager;
  protected transactionManager: EntityManager;

  constructor(manager: EntityManager) {
    this.manager = manager;
  }

  protected async runTransaction<TResult>(
    cb: (manager: EntityManager) => Promise<TResult>,
    isolationLevel?: IsolationLevel,
  ) {
    if (this.transactionManager) {
      return cb(this.transactionManager);
    }
    return this.manager.transaction(
      isolationLevel,
      async (transactionManager) => {
        return cb(transactionManager);
      },
    );
  }

  /**
   * Clones the class and updates the transaction manager in the class with the manager inserted from the caller
   * @param {EntityManager} manager
   * @returns {this}
   */
  withTransaction(manager?: EntityManager): this {
    const cloned: this = Object.create(this);
    if (manager) {
      cloned.transactionManager = manager;
    }

    return cloned;
  }
}
