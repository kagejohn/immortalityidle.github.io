import { Injectable, Injector, OnInit } from '@angular/core';
import { LogService } from '../log-panel/log.service';
import { CharacterService } from '../game-state/character.service';
import { Furniture, InventoryService, Item, instanceOfFurniture } from '../game-state/inventory.service';
import { HomeService, HomeType, Home } from '../game-state/home.service';
import { ItemRepoService } from '../game-state/item-repo.service';
import { StoreService } from './store.service';
import { MainLoopService } from '../main-loop.service';
import { BattleService } from '../battle-panel/battle.service';
import { GameStateService } from './game-state.service';
import { ActivityService } from '../activity-panel/activity.service';

export interface Achievement {
  name: string;
  description: string;
  check: () => boolean;
  effect: () => void;
  unlocked: boolean;
}

export interface AchievementProperties {
  unlockedAchievements: string[]
}

@Injectable({
  providedIn: 'root'
})
export class AchievementService {
  gameStateService?: GameStateService;
  unlockedAchievements: string[] = [];

  constructor(
    private mainLoopService: MainLoopService,
    private injector: Injector,    
    private logService: LogService,
    private characterService: CharacterService,
    private inventoryService: InventoryService,
    private itemRepoService: ItemRepoService,
    private storeService: StoreService,
    private battleService: BattleService,
    private homeService: HomeService,
    private activityService: ActivityService
  ) {
    this.mainLoopService.longTickSubject.subscribe(() => {
      for (let achievement of this.achievements) {
        if (!this.unlockedAchievements.includes(achievement.name)){
          if (achievement.check()){
            this.unlockAchievement(achievement, true);
          }
        }
      }
    });
  }

  // important: achievement effects must be idempotent as they may be called multiple times
  achievements: Achievement[] = [
    {
      name: "Bookworm",
      description: "You opened the manuals shop and unlocked the " + this.itemRepoService.items['fastPlayManual'].name,
      check: () => {
        return this.storeService.storeOpened;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['fastPlayManual']);
      },
      unlocked: false
    },
    {
      name: "Played a Bit",
      description: "You worked toward immortality for ten years across your lifetimes and unlocked the " + this.itemRepoService.items['fasterPlayManual'].name,
      check: () => {
        return this.mainLoopService.totalTicks > 3650;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['fasterPlayManual']);
      },
      unlocked: false
    },
    {
      name: "Basically an Expert",
      description: "You worked toward immortality for one hundred years across your lifetimes and unlocked the " + this.itemRepoService.items['fastestPlayManual'].name,
      check: () => {
        return this.mainLoopService.totalTicks > 36500;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['fastestPlayManual']);
      },
      unlocked: false
    },
    {
      name: "Agricultural Aptitude",
      description: "You plowed 88 fields and unlocked the " + this.itemRepoService.items['perpetualFarmingManual'].name,
      check: () => {
        return this.homeService.fields.length >= 88;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['perpetualFarmingManual']);
      },
      unlocked: false
    },
    {
      name: "Persitent Reincarnator",
      description: "You lived 48 lives and unlocked the " + this.itemRepoService.items['restartActivityManual'].name,
      check: () => {
        return this.characterService.characterState.totalLives >= 48;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['restartActivityManual']);
      },
      unlocked: false
    },
    {
      name: "This Sparks Joy",
      description: "You used 888 items and unlocked the " + this.itemRepoService.items['autoUseManual'].name,
      check: () => {
        return this.inventoryService.lifetimeUsedItems >= 888;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['autoUseManual']);
      },
      unlocked: false
    },
    {
      name: "This Does Not Spark Joy",
      description: "You filled your entire inventory and unlocked the " + this.itemRepoService.items['autoSellManual'].name,
      check: () => {
        return this.inventoryService.openInventorySlots() == 0;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['autoSellManual']);
      },
      unlocked: false
    },
    {
      name: "All Things In Moderation",
      description: "You sold and used 8888 items and unlocked the " + this.itemRepoService.items['autoBalanceManual'].name,
      check: () => {
        return this.inventoryService.lifetimeUsedItems >= 8888 && this.inventoryService.lifetimeSoldItems >= 8888;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['autoBalanceManual']);
      },
      unlocked: false
    },
    {
      name: "Land Rush",
      description: "You owned 520 plots of land and unlocked the " + this.itemRepoService.items['autoBuyLandManual'].name,
      check: () => {
        return this.homeService.land >= 520;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['autoBuyLandManual']);
      },
      unlocked: false
    },
    {
      name: "Real Housewives of Immortality",
      description: "You acquired a very fine home and unlocked the " + this.itemRepoService.items['autoBuyHomeManual'].name,
      check: () => {
        return this.homeService.homeValue >= HomeType.CourtyardHouse;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['autoBuyHomeManual']);
      },
      unlocked: false
    },
    {
      name: "Off to Ikea",
      description: "You filled all your furniture slots and unlocked the " + this.itemRepoService.items['autoBuyFurnitureManual'].name,
      check: () => {
        return this.homeService.furniture.bathtub != null &&
          this.homeService.furniture.bed != null &&
          this.homeService.furniture.kitchen != null &&
          this.homeService.furniture.workbench != null;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['autoBuyFurnitureManual']);
      },
      unlocked: false
    },
    {
      name: "Time to Buy a Tractor",
      description: "You plowed 888 fields and unlocked the " + this.itemRepoService.items['autoFieldManual'].name,
      check: () => {
        return this.homeService.fields.length >= 888;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['autoFieldManual']);
      },
      unlocked: false
    },
    {
      name: "Guzzler",
      description: "You drank 88 potions and unlocked the " + this.itemRepoService.items['autoPotionManual'].name,
      check: () => {
        return this.inventoryService.lifetimePotionsUsed >= 88;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['autoPotionManual']);
      },
      unlocked: false
    },
    {
      name: "Junkie",
      description: "You took 131 pills and unlocked the " + this.itemRepoService.items['autoPillManual'].name,
      check: () => {
        return this.inventoryService.lifetimePillsUsed >= 131;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['autoPillManual']);
      },
      unlocked: false
    },
    {
      name: "Monster Slayer",
      description: "You killed 131 monsters and unlocked the " + this.itemRepoService.items['autoTroubleManual'].name,
      check: () => {
        return this.battleService.troubleKills >= 131;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['autoTroubleManual']);
      },
      unlocked: false
    },
    {
      name: "Weapons Master",
      description: "You wielded powerful weapons of both metal and wood and unlocked the " + this.itemRepoService.items['autoWeaponMergeManual'].name,
      check: () => {
        if (this.characterService.characterState.equipment?.rightHand?.weaponStats &&
          this.characterService.characterState.equipment?.rightHand?.weaponStats.baseDamage >= 131 &&
          this.characterService.characterState.equipment?.leftHand?.weaponStats &&
          this.characterService.characterState.equipment?.leftHand?.weaponStats.baseDamage >= 131
          ){
          return true;
        }
        return false;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['autoWeaponMergeManual']);
      },
      unlocked: false
    },
    {
      name: "Practically Invincible",
      description: "You equipped yourself with powerful armor and unlocked the " + this.itemRepoService.items['autoArmorMergeManual'].name,
      check: () => {
        if (this.characterService.characterState.equipment?.head?.armorStats &&
          this.characterService.characterState.equipment?.head?.armorStats.defense >= 131 &&
          this.characterService.characterState.equipment?.body?.armorStats &&
          this.characterService.characterState.equipment?.body?.armorStats.defense >= 131 &&
          this.characterService.characterState.equipment?.legs?.armorStats &&
          this.characterService.characterState.equipment?.legs?.armorStats.defense >= 131 &&
          this.characterService.characterState.equipment?.feet?.armorStats &&
          this.characterService.characterState.equipment?.feet?.armorStats.defense >= 131){
          return true;
        }
        return false;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['autoArmorMergeManual']);
      },
      unlocked: false
    },
    {
      name: "Gemologist",
      description: "You acquired 88 gems and unlocked the " + this.itemRepoService.items['useSpiritGemManual'].name,
      check: () => {
        return this.battleService.troubleKills > 88;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['useSpiritGemManual']);
      },
      unlocked: false
    },
    {
      name: "Ingredient Snob",
      description: "You achieved a deep understanding of herbs and unlocked the " + this.itemRepoService.items['bestHerbsManual'].name,
      check: () => {
        return this.characterService.characterState.attributes.woodLore.value > 1024;
      },
      effect: () => {
        this.storeService.unlockManual(this.itemRepoService.items['bestHerbsManual']);
      },
      unlocked: false
    },
    {
      name: "Grandpa's Old Tent",
      description: "You've gone through eight cycles of reincarnation and come to understand the value of grandfathers.",
      check: () => {
        return this.characterService.characterState.totalLives > 8;
      },
      effect: () => {
        this.homeService.grandfatherTent = true;
      },
      unlocked: false
    },
    {
      name: "Paternal Pride",
      description: "You've worked 888 days of odd jobs and come to understand the value of fathers.",
      check: () => {
        return this.activityService.oddJobDays > 888;
      },
      effect: () => {
        this.characterService.fatherGift = true;
      },
      unlocked: false
    },
    {
      name: "Maternal Love",
      description: "You've done 888 days of begging and come to understand the value of mothers.",
      check: () => {
        return this.activityService.beggingDays > 888;
      },
      effect: () => {
        this.inventoryService.motherGift = true;
      },
      unlocked: false
    },
    {
      name: "Grandma's Stick",
      description: "You've developed spirituality and come to understand the value of grandmothers.",
      check: () => {
        return this.characterService.characterState.attributes.spirituality.value > 0;
      },
      effect: () => {
        this.inventoryService.grandmotherGift = true;
      },
      unlocked: false
    },

    
    
  ];

  unlockAchievement(achievement: Achievement, newAchievement: boolean){
    if (newAchievement){
      this.unlockedAchievements.push(achievement.name);
      this.logService.addLogMessage(achievement.description, 'STANDARD', 'STORY');
      // check if inventoryService is injected yet, if not, inject it (circular dependency issues)
      if (!this.gameStateService){
        this.gameStateService = this.injector.get(GameStateService);
      }
      this.gameStateService.savetoLocalStorage();
    }
    achievement.effect();
    achievement.unlocked = true;
  }

  getProperties(): AchievementProperties {
    return {
      unlockedAchievements: this.unlockedAchievements
    }
  }

  setProperties(properties: AchievementProperties) {
    this.unlockedAchievements = properties.unlockedAchievements || [];
    for (let achievement of this.achievements) {
      if (this.unlockedAchievements.includes(achievement.name)){
        this.unlockAchievement(achievement, false);
      }
    }
  }

}
