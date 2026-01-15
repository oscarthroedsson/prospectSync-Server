import { Cache, CacheOptions } from "another-cache";

// Om du har ExtendedCache, annars använd bara Cache
class CacheService {
  private static instance: CacheService;

  readonly process: Cache;
  readonly userProcess: Cache;
  readonly userProcessStep: Cache;
  readonly userProcessMany: Cache;
  readonly jobPosting: Cache;
  readonly user: Cache;
  readonly trigger: Cache;
  readonly step: Cache;

  private constructor() {
    const defaultOptions: CacheOptions = {
      ttl: 3600000, // 1 hour in ms
      cleanupInterval: 300000, // 5 min in ms
      evictionPolicy: "LRU",
    };

    // Skapa alla cache namespaces
    this.process = new Cache(defaultOptions);
    this.userProcess = new Cache(defaultOptions);
    this.userProcessStep = new Cache(defaultOptions);
    this.userProcessMany = new Cache(defaultOptions);

    this.jobPosting = new Cache({
      ...defaultOptions,
    });

    this.user = new Cache({
      ...defaultOptions,
    });

    this.trigger = new Cache({
      ...defaultOptions,
    });

    this.step = new Cache({
      ...defaultOptions,
    });

    // Setup event listeners om du behöver
    this.setupEventListeners();
  }

  private setupEventListeners() {
    // this.process.on("set", (key, value) => {
    //   // Handle events
    // });
  }

  static getInstance(): CacheService {
    if (!CacheService.instance) CacheService.instance = new CacheService();
    return CacheService.instance;
  }

  // Global operations
  clearAll() {
    this.process.clear();
    this.userProcess.clear();
    this.userProcessStep.clear();
    this.userProcessMany.clear();
    this.jobPosting.clear();
    this.user.clear();
    this.trigger.clear();
    this.step.clear();
  }
}

export const cacheService = CacheService.getInstance();
