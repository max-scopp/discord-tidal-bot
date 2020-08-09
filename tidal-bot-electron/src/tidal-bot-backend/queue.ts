interface Queue {
  user: string;
  url: string;
}

/**
 * - Add non-mastering requests
 * - master queue takes priority
 * - infinity queue
 * - radio queue
 */
export default class QueueManager {

  private externalQueue: Queue[] = [];
  private masterQueue: Queue[] = [];
  private selectedPlaylist: string;

}