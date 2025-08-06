// src/context/managers/BannerManager.ts
// Handles banner activation and management

import { BannerActivationResult } from '../types/EnhancedGachaTypes';

interface BannerConfig {
  id: string;
  name: string;
  featured_characters: string[];
  rate_up_active: boolean;
  start_date: string;
  end_date: string;
  special_mechanics?: {
    step_up_system?: boolean;
    guaranteed_featured?: number;
    bonus_materials?: Record<string, number>;
  };
  description?: string;
  background_image?: string;
}

export class BannerManager {
  private banners: Record<string, BannerConfig> = {
    'strength_legends': {
      id: 'strength_legends',
      name: 'Strength Legends',
      featured_characters: ['leg_titan', 'epic_beast'],
      rate_up_active: true,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
      special_mechanics: {
        step_up_system: true,
        guaranteed_featured: 90,
        bonus_materials: { 'strength_essence': 10 },
      },
      description: 'Increased rates for legendary strength-based characters!',
      background_image: '/banners/strength_legends.jpg',
    },
    
    'speed_masters': {
      id: 'speed_masters',
      name: 'Speed Masters',
      featured_characters: ['leg_lightning', 'epic_dash'],
      rate_up_active: true,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days
      special_mechanics: {
        guaranteed_featured: 60,
        bonus_materials: { 'speed_essence': 8, 'agility_crystal': 5 },
      },
      description: 'Lightning-fast characters with enhanced speed stats!',
      background_image: '/banners/speed_masters.jpg',
    },
    
    'endurance_champions': {
      id: 'endurance_champions',
      name: 'Endurance Champions',
      featured_characters: ['leg_marathon', 'epic_stamina'],
      rate_up_active: true,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      special_mechanics: {
        step_up_system: true,
        guaranteed_featured: 75,
        bonus_materials: { 'endurance_essence': 12 },
      },
      description: 'Champions built for the long haul!',
      background_image: '/banners/endurance_champions.jpg',
    },
  };
  
  // Banner management
  public activateBanner(bannerId: string): BannerActivationResult {
    const banner = this.banners[bannerId];
    if (!banner) {
      return { success: false, error: 'Banner not found' };
    }
    
    // Check if banner is still active
    const now = new Date();
    const endDate = new Date(banner.end_date);
    
    if (now > endDate) {
      return { success: false, error: 'Banner has expired' };
    }
    
    return { success: true, banner };
  }
  
  // Get all available banners
  public getAvailableBanners(): BannerConfig[] {
    const now = new Date();
    
    return Object.values(this.banners).filter(banner => {
      const startDate = new Date(banner.start_date);
      const endDate = new Date(banner.end_date);
      return now >= startDate && now <= endDate;
    });
  }
  
  // Get banner by ID
  public getBanner(bannerId: string): BannerConfig | null {
    return this.banners[bannerId] || null;
  }
  
  // Check if a character is featured in current banner
  public isCharacterFeatured(characterId: string, bannerId: string): boolean {
    const banner = this.getBanner(bannerId);
    return banner?.featured_characters.includes(characterId) || false;
  }
  
  // Get time remaining for banner
  public getBannerTimeRemaining(bannerId: string): {
    days: number;
    hours: number;
    minutes: number;
  } | null {
    const banner = this.getBanner(bannerId);
    if (!banner) return null;
    
    const now = new Date();
    const endDate = new Date(banner.end_date);
    const timeDiff = endDate.getTime() - now.getTime();
    
    if (timeDiff <= 0) return { days: 0, hours: 0, minutes: 0 };
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    
    return { days, hours, minutes };
  }
}