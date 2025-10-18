# RMMV_plugins_agold404

[itch.io](https://agold404.itch.io/agold404-rmmv-plugins)

[live demo use case](https://github.com/aaaaagold/MyLightBalls)



# Guides to Functionalities of Plugins

scenes -> items -> plugins

- [System Side](#system-side-no-specified-scenes)
- [Initialization Loading](#initialization-loading-scene_boot)
- [Title Screen](#title-screen-scene_title)
- [In Map](#in-map-scene_map)
- [In Battle](#in-battle-scene_battle)
- [Main Menu](#main-menu-scene_menu)
- [Backpack](#backpack-scene_item)
- [Skills](#skills-scene_skill)
- [Equips](#equips-scene_equip)
- [Save/Load](#saveload-scene_save-scene_load)
- [Other Scenes](#other-scenes)


## System Side (no specified scenes)

- fast forward: `agold404_FastForward.js`
- total play time: `agold404_TotalPlayTime.js`
- press a key to pause: `agold404_PressPToPause.js`

screen effect
- show an image as animation (with frames): `agold404_ImgAutoAni.js`
- shake screen with Y-direction: `agold404_ShakeScreenY.js`

sound effect
- echo: `agold404_Se.js`

message window
- general text
  - align left/center/right: `agold404_TextPosition.js`
  - specify contents via JavaScript: `agold404_EvalToStr.js`
- helper window lines: `agold404_WindowHelpDefaultNumLines.js`
- name field in Window_Message: `agold404_NameField.js`
- popup message: `agold404_PopupMsg.js`
- number board: `agold404_NumBoard.js`
- make styled text (e.g. item name, skill name): `agold404_MakeStyledText.js`

item / skill effects
- effect from JavaScript: `agold404_ItemEffectJavascript.js`

actor/enemy ability
- adjust existing abilities: `agold404_CustomAbilityEval.js`
- custom ability properties: `agold404_AllocateAbility.js`
- drop rate: `agold404_DropRate.js`
- states
  - duplicated state (stacked multiple times): `agold404_Trait_duplicatedStates.js`
- duplicated actors: `agold404_Api_duplicatedActors.js`


## Initialization Loading (Scene_Boot)

### do something before loaded
- by JavaScript: `agold404_StartupEval.js`


## Title Screen (Scene_Title)


## In Map (Scene_Map)

### common in events, characters, and player's character
all of these are instance of Game_Character

### events
some Game_Event -only plugins

- operation
  - copy event: `agold404_CopyEvent.js`
  - move when out of screen: `agold404_EventLongDistDetection.js`

- visual
  - show text: `agold404_EventText.js`
  - initial opacity: `agold404_EventOpacity.js`

- hit box
  - expand range: `agold404_ExpandEventRange.js`
  - through with condition: `agold404_ThroughEventsOnly.js`

- trigger
  - not by player: `agold404_NullEventTrigger.js`
  - by another event: `agold404_EventTriggersEvents.js`
  - expand range: `agold404_ExpandEventRange.js`
  - can be triggered right on the event no matter what: `agold404_EventTriggerHere.js`

- character ability
  - vision: `agold404_InChrVision.js`


## In Battle (Scene_Battle)

### item drops
- specified by JavaScript: `agold404_EnemyDropItemsEval.js`
- drop rate: `agold404_DropRate.js`


## Main Menu (Scene_Menu)

### commands

- change accessibility during the game: `agold404_MenuCommandAccess.js`


## Backpack (Scene_Item)

### sorting

- change order (and changed by player): `agold404_ItemOrder.js`


## Skills (Scene_Skill)

### additional functionalities

- skill tree: `agold404_SkillTree.js`

- bring skills: `agold404_BringSkills.js`


## Equips (Scene_Equip)

### equip slot

- adjust slot num: `agold404_Trait_adjustEquipSlots.js`

### equip param

- adjust worn equips params: `agold404_Trait_adjustEquipsParams.js`
- random params: `agold404_RandomEquipParams.js`

### equip lock

- self-locked: `agold404_SelfLockedEquipment.js`


## Save/Load (Scene_Save, Scene_Load)

### import / export
currently not in these scenes. see `Other Scenes` -> `Scene_Options`


## Other Scenes

### Scene_Options
option adjusting scene

- import / export from local files: `agold404_SaveManager.js`

- adjust step size: `agold404_WindowOptions_volumeOffset.js`

### Scene_Depository
(added scene) depository scene: `agold404_Depository.js`

### Scene_FlashbackText
(added scene) flashback of texts: `agold404_FlashbackText.js`

