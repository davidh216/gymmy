// ==============================================================================
// PART 4: CharacterDetailsModal.js - Detailed Character View
// ==============================================================================

const CharacterDetailsModal = ({ visible, character, onClose, onSetActive, isActive }) => {
    if (!character) return null;
    
    const getConditionColor = (value) => {
      if (value >= 70) return '#4CAF50';
      if (value >= 40) return '#FFC107';
      return '#F44336';
    };
    
    const getConditionText = (value) => {
      if (value >= 80) return 'Excellent';
      if (value >= 60) return 'Good';
      if (value >= 40) return 'Fair';
      if (value >= 20) return 'Poor';
      return 'Critical';
    };
    
    return (
      <Modal visible={visible} transparent animationType="slide">
        <View style={styles.detailsOverlay}>
          <View style={styles.detailsContainer}>
            <ScrollView>
              {/* Header */}
              <View style={[styles.detailsHeader, { backgroundColor: character.rarity_color }]}>
                <Text style={styles.detailsRarity}>{character.rarity.toUpperCase()}</Text>
                <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>
              
              {/* Character Info */}
              <View style={styles.detailsContent}>
                <Text style={styles.detailsArtwork}>{character.artwork}</Text>
                <Text style={styles.detailsName}>{character.name}</Text>
                <Text style={styles.detailsDescription}>{character.description}</Text>
                
                {/* Level and Experience */}
                <View style={styles.levelSection}>
                  <Text style={styles.levelText}>Level {character.level}</Text>
                  <Text style={styles.expText}>EXP: {character.experience}</Text>
                </View>
                
                {/* Current Stats */}
                <View style={styles.statsSection}>
                  <Text style={styles.sectionTitle}>CURRENT STATS</Text>
                  <View style={styles.statsGrid}>
                    {Object.entries(character.current_stats).map(([stat, value]) => (
                      <View key={stat} style={styles.statRow}>
                        <Text style={styles.statName}>{stat.toUpperCase()}</Text>
                        <View style={styles.statBar}>
                          <View style={[
                            styles.statFill,
                            { width: `${value}%`, backgroundColor: character.rarity_color }
                          ]} />
                        </View>
                        <Text style={styles.statNumber}>{value}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                
                {/* Character Condition (Tamagotchi-style) */}
                <View style={styles.conditionSection}>
                  <Text style={styles.sectionTitle}>CHARACTER CONDITION</Text>
                  {Object.entries(character.condition).map(([condition, value]) => (
                    <View key={condition} style={styles.conditionRow}>
                      <Text style={styles.conditionName}>{condition.toUpperCase()}</Text>
                      <View style={styles.conditionBar}>
                        <View style={[
                          styles.conditionFill,
                          { width: `${value}%`, backgroundColor: getConditionColor(value) }
                        ]} />
                      </View>
                      <Text style={[styles.conditionStatus, { color: getConditionColor(value) }]}>
                        {getConditionText(value)}
                      </Text>
                    </View>
                  ))}
                </View>
                
                {/* Special Ability */}
                <View style={styles.abilitySection}>
                  <Text style={styles.sectionTitle}>SPECIAL ABILITY</Text>
                  <View style={[styles.abilityCard, { borderColor: character.rarity_color }]}>
                    <Text style={styles.abilityName}>{character.special_ability.split(':')[0]}</Text>
                    <Text style={styles.abilityDescription}>{character.special_ability.split(':')[1]}</Text>
                  </View>
                </View>
                
                {/* Personality */}
                <View style={styles.personalitySection}>
                  <Text style={styles.sectionTitle}>PERSONALITY</Text>
                  <View style={styles.personalityGrid}>
                    {Object.entries(character.personality).map(([trait, value]) => (
                      <View key={trait} style={styles.personalityItem}>
                        <Text style={styles.personalityTrait}>{trait.replace('_', ' ').toUpperCase()}</Text>
                        <Text style={styles.personalityValue}>{value}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>
            
            {/* Action Buttons */}
            <View style={styles.actionButtons}>
              {!isActive && (
                <TouchableOpacity
                  style={[styles.setActiveButton, { backgroundColor: character.rarity_color }]}
                  onPress={() => onSetActive(character.instance_id)}
                >
                  <Text style={styles.setActiveText}>SET AS ACTIVE</Text>
                </TouchableOpacity>
              )}
              
              {isActive && (
                <View style={styles.activeIndicator}>
                  <Text style={styles.activeIndicatorText}>⭐ ACTIVE CHARACTER ⭐</Text>
                </View>
              )}
              
              <TouchableOpacity style={styles.careButton}>
                <Text style={styles.careButtonText}>💝 CARE FOR CHARACTER</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };