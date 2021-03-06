import { Injectable } from "@angular/core";
import { StorageService, StorageKeys } from "./storage.service";
import {
  ProfileType,
  statusType,
  configType,
  settingType,
  walletType,
  assetType,
  resultType,
  historyType
} from "./types.service";
import { ResultService } from "./result.service";
import { ConfigService } from "./config.service";
import { NGXLogger } from "ngx-logger";
import * as sjcl from "sjcl";

@Injectable({
  providedIn: 'root',
})

export class ProfileService {

  private static profile: ProfileType;
  private isLoaded: boolean;

  constructor(
    private storage: StorageService,
    private configService: ConfigService,
    private result: ResultService,
    private logger: NGXLogger
  ) {
    this.isLoaded = false;
    ProfileService.profile = {
      status: this.configService.statusDefault,
      config: this.configService.configDefault,
      setting: this.configService.settingDefault,
      wallet: this.configService.walletDefault,
      asset: this.configService.assetDefault,
      history: {}
    };
  }

  get profile(): ProfileType {
    return ProfileService.profile;
  }

  set profile(profile: ProfileType) {
    ProfileService.profile = profile;
  }

  get wallet(): walletType {
    return ProfileService.profile.wallet;
  }

  set wallet(wallet: walletType) {
    ProfileService.profile.wallet = wallet;
  }

  get config(): configType {
    return ProfileService.profile.config;
  }

  set config(config: configType) {
    ProfileService.profile.config = config;
  }

  get setting(): settingType {
    return ProfileService.profile.setting;
  }

  set setting(setting: settingType) {
    ProfileService.profile.setting = setting;
  }

  get status(): statusType {
    return ProfileService.profile.status;
  }

  set status(status: statusType) {
    ProfileService.profile.status = status;
  }

  async loadProfile(): Promise<ProfileType> {
    let profile: any = {};
    try {
      let status = await this.loadStatus();
      profile.status = status;
      let wallet = await this.loadWallet();
      profile.wallet = wallet;
      let config = await this.loadConfig();
      profile.config = config;
      let setting = await this.loadSetting();
      profile.setting = setting;
      this.isLoaded = true;
      return profile;
    } catch (error) {
      throw this.result.error(error);
    }
  }

  async storeProfile(profile: ProfileType) {
    try {
      await this.storeStatus(profile.status);
      await this.storeConfig(profile.config);
      await this.storeSetting(profile.setting);
      return this.result.success(profile);
    } catch (error) {
      return this.result.error("storeProfile fault");
    }
  }

  loadWallet(): Promise<walletType> {
    return this.storage.get(StorageKeys.WALLET);
  }

  storeWallet(wallet: walletType): Promise<resultType> {
    ProfileService.profile.wallet = wallet;
    return this.storage.set(StorageKeys.WALLET, wallet);
  }

  loadSetting(): Promise<settingType> {
    return this.storage.get(StorageKeys.SETTINGS);
  }

  storeSetting(setting: settingType): Promise<resultType> {
    ProfileService.profile.setting = setting;
    return this.storage.set(StorageKeys.SETTINGS, setting);
  }

  loadConfig(): Promise<configType> {
    return this.storage.get(StorageKeys.CONFIG);
  }

  storeConfig(config: configType): Promise<resultType> {
    ProfileService.profile.config = config;
    return this.storage.set(StorageKeys.CONFIG, config);
  }

  loadStatus(): Promise<statusType> {
    return this.storage.get(StorageKeys.STATUS);
  }

  storeStatus(status: statusType): Promise<resultType> {
    ProfileService.profile.status = status;
    return this.storage.set(StorageKeys.STATUS, status);
  }

  loadAsset(): Promise<assetType> {
    return this.storage.get(StorageKeys.ASSET);
  }

  storeAsset(asset: assetType): Promise<resultType> {
    ProfileService.profile.asset = asset;
    return this.storage.set(StorageKeys.ASSET, asset);
  }

  loadHistory(): Promise<historyType> {
    return this.storage.get(StorageKeys.HISTORY);
  }

  storeHistory(history: historyType): Promise<resultType> {
    ProfileService.profile.history = history;
    return this.storage.set(StorageKeys.HISTORY, history);
  }

  lock(password: string): Promise<resultType> {
    return new Promise((resolve, rejects) => {
      if (ProfileService.profile.status.isLock) {
        rejects(this.result.warn("Already is locked"));
      } else {
        try {
          ProfileService.profile.wallet.privkeyEncrypted = sjcl.encrypt(
            password,
            ProfileService.profile.wallet.privkey
          );
          ProfileService.profile.wallet.privkey = null;
          ProfileService.profile.status.isLock = true;
          this.storeWallet(ProfileService.profile.wallet).then(ret => {
            this.logger.info(ret);
            if (ret.status == "success") {
              this.storeStatus(ProfileService.profile.status).then(ret => {
                resolve(this.result.success("locked"));
              });
            } else {
              rejects(this.result.error("Store wallet error"));
            }
          });
        } catch (error) {
          this.logger.error(error);
          rejects(this.result.error("Set password error"));
        }
      }
    });
  }

  unlock(password: string): Promise<resultType> {
    return new Promise((resolve, rejects) => {
      if (!ProfileService.profile.status.isLock) {
        rejects(this.result.warn("Already is unlocked"));
      } else {
        try {
          ProfileService.profile.wallet.privkey = sjcl.decrypt(
            password,
            ProfileService.profile.wallet.privkeyEncrypted
          );
          ProfileService.profile.wallet.privkeyEncrypted = null;
          ProfileService.profile.status.isLock = false;
          this.storeWallet(ProfileService.profile.wallet).then(ret => {
            this.logger.info(ret);
            if (ret.status == "success") {
              this.storeStatus(ProfileService.profile.status).then(ret => {
                resolve(this.result.success("Unlocked"));
              });
            } else {
              rejects(this.result.error("Store wallet error"));
            }
          });
        } catch (error) {
          this.logger.error(error);
          rejects(this.result.error("Wrong password"));
        }
      }
    });
  }
}
