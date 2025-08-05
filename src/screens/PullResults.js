// ==============================================================================
// PART 2: PullResultsModal.js - Exciting Results Display
// ==============================================================================

const PullResultsModal = ({ visible, results, onClose, rarityGradients }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealAnimation] = useState(new Animated.Value(0));
    
    React.useEffect(() => {
      if (visible && results.length > 0) {
        setCurrentIndex(0);
        // Animate reveal
        Animated.timing(revealAnimation, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      }
    }, [visible, results]);
    
    const nextResult = () => {
      if (currentIndex < results.length - 1) {
        setCurrentIndex(currentIndex + 1);
        revealAnimation.setValue(0);
        Animated.timing(revealAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      } else {
        onClose();
      }
    };
    
    if (!visible || results.length === 0) return null;
    
    const currentResult = results[currentIndex];
    const isLegendary = currentResult.rarity === 'legendary';
    const isEpic = currentResult.rarity === 'epic';
    
    const cardScale = revealAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.5, 1],
    });
    
    const cardOpacity = revealAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 1],
    });
    
    return (
      <Modal visible={visible} transparent animationType="fade">
        <View style={styles.resultsOverlay}>
          <View style={styles.resultsContainer}>
            {/* Rarity announcement */}
            <Text style={[
              styles.rarityAnnouncement,
              { color: currentResult.rarity_color }
            ]}>
              {isLegendary && "🌟 LEGENDARY SUMMON! 🌟"}
              {isEpic && "⚡ EPIC SUMMON! ⚡"}
              {currentResult.rarity === 'rare' && "✨ RARE SUMMON! ✨"}
              {currentResult.rarity === 'common' && "New Ally Summoned!"}
            </Text>
            
            {/* Character Card */}
            <Animated.View
              style={[
                styles.characterCard,
                {
                  borderColor: currentResult.rarity_color,
                  transform: [{ scale: cardScale }],
                  opacity: cardOpacity,
                }
              ]}
            >
              <View style={[styles.cardHeader, { backgroundColor: currentResult.rarity_color }]}>
                <Text style={styles.cardRarity}>{currentResult.rarity.toUpperCase()}</Text>
              </View>
              
              <View style={styles.cardContent}>
                <Text style={styles.characterArtwork}>{currentResult.artwork}</Text>
                <Text style={styles.characterName}>{currentResult.name}</Text>
                <Text style={styles.characterDescription}>{currentResult.description}</Text>
                
                {/* Stats Preview */}
                <View style={styles.statsPreview}>
                  <Text style={styles.statsTitle}>BASE STATS</Text>
                  <View style={styles.statsGrid}>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>STR</Text>
                      <Text style={styles.statValue}>{currentResult.base_stats.strength}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>CAR</Text>
                      <Text style={styles.statValue}>{currentResult.base_stats.cardio}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>FLX</Text>
                      <Text style={styles.statValue}>{currentResult.base_stats.flexibility}</Text>
                    </View>
                    <View style={styles.statItem}>
                      <Text style={styles.statLabel}>FOC</Text>
                      <Text style={styles.statValue}>{currentResult.base_stats.focus}</Text>
                    </View>
                  </View>
                </View>
                
                {/* Special Ability */}
                <View style={styles.specialAbility}>
                  <Text style={styles.abilityTitle}>SPECIAL ABILITY</Text>
                  <Text style={styles.abilityText}>{currentResult.special_ability}</Text>
                </View>
              </View>
            </Animated.View>
            
            {/* Progress indicator */}
            <Text style={styles.progressText}>
              {currentIndex + 1} / {results.length}
            </Text>
            
            {/* Continue button */}
            <TouchableOpacity style={styles.continueButton} onPress={nextResult}>
              <Text style={styles.continueText}>
                {currentIndex < results.length - 1 ? "NEXT >" : "FINISH"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };
  