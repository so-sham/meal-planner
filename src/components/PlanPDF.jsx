import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const SAGE = '#87A96B';
const TERRA = '#C67C4E';
const CREAM = '#FFF8E7';
const BARK = '#4A3728';
const BARK_LIGHT = '#8B7355';
const WHITE = '#FFFFFF';

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const s = StyleSheet.create({
  page: {
    backgroundColor: CREAM,
    padding: 36,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: SAGE,
    paddingBottom: 12,
  },
  brand: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: SAGE,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: BARK_LIGHT,
    marginBottom: 2,
  },
  targetRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
  },
  targetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E8E0D0',
  },
  targetLabel: {
    fontSize: 8,
    color: BARK_LIGHT,
    marginRight: 4,
  },
  targetValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BARK,
  },
  dayHeader: {
    backgroundColor: SAGE,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 10,
    marginTop: 4,
  },
  dayHeaderText: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
  },
  mealCard: {
    backgroundColor: WHITE,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E8E0D0',
  },
  slotLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: SAGE,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 3,
  },
  mealName: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: BARK,
    marginBottom: 2,
  },
  mealDesc: {
    fontSize: 8,
    color: BARK_LIGHT,
    marginBottom: 8,
    lineHeight: 1.3,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 6,
  },
  macroBox: {
    flex: 1,
    backgroundColor: CREAM,
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: BARK,
  },
  macroLabel: {
    fontSize: 6,
    color: BARK_LIGHT,
    textTransform: 'uppercase',
    marginTop: 1,
  },
  proteinBox: {
    backgroundColor: '#EDF5E1',
    borderWidth: 1,
    borderColor: SAGE,
  },
  ingredientsSection: {
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F0EBE0',
  },
  ingredientsLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: BARK_LIGHT,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 3,
  },
  ingredientText: {
    fontSize: 8,
    color: BARK_LIGHT,
    lineHeight: 1.4,
  },
  boosterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EDF5E1',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 6,
    borderWidth: 1,
    borderColor: SAGE,
    borderStyle: 'dashed',
  },
  boosterText: {
    fontSize: 8,
    color: SAGE,
    fontFamily: 'Helvetica-Bold',
  },
  summaryBar: {
    flexDirection: 'row',
    backgroundColor: BARK,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
    gap: 6,
  },
  summaryCell: {
    flex: 1,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: WHITE,
  },
  summaryLabel: {
    fontSize: 7,
    color: '#C4B8A8',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  summaryVsTarget: {
    fontSize: 7,
    color: TERRA,
    marginTop: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E8E0D0',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: BARK_LIGHT,
  },
});

function MacroBoxView({ label, value, unit, isProtein }) {
  return (
    <View style={[s.macroBox, isProtein && s.proteinBox]}>
      <Text style={[s.macroValue, isProtein && { color: SAGE }]}>
        {Math.round(value)}{unit}
      </Text>
      <Text style={s.macroLabel}>{label}</Text>
    </View>
  );
}

function MealCardView({ meal }) {
  const boosterTotals = (meal.boosters || []).reduce(
    (a, b) => ({ cal: a.cal + (b.cal || 0), protein: a.protein + (b.protein || 0) }),
    { cal: 0, protein: 0 },
  );

  return (
    <View style={s.mealCard} wrap={false}>
      <Text style={s.slotLabel}>{meal.slotLabel}</Text>
      <Text style={s.mealName}>{meal.name}</Text>
      {meal.desc && <Text style={s.mealDesc}>{meal.desc}</Text>}

      <View style={s.macroRow}>
        <MacroBoxView label="Calories" value={(meal.cal || 0) + boosterTotals.cal} unit="" />
        <MacroBoxView label="Protein" value={(meal.protein || 0) + boosterTotals.protein} unit="g" isProtein />
        <MacroBoxView label="Carbs" value={meal.carbs || 0} unit="g" />
        <MacroBoxView label="Fat" value={meal.fat || 0} unit="g" />
      </View>

      {meal.ingredients?.length > 0 && (
        <View style={s.ingredientsSection}>
          <Text style={s.ingredientsLabel}>Ingredients</Text>
          <Text style={s.ingredientText}>{meal.ingredients.join(', ')}</Text>
        </View>
      )}

      {meal.boosters?.map((b, i) => (
        <View key={i} style={s.boosterPill}>
          <Text style={s.boosterText}>
            + {b.text || b.name} (+{b.protein}g protein)
          </Text>
        </View>
      ))}
    </View>
  );
}

function DaySummaryView({ meals, prefs }) {
  const totals = (meals || []).reduce((a, m) => {
    const bp = (m.boosters || []).reduce((s2, b) => s2 + (b.protein || 0), 0);
    const bc = (m.boosters || []).reduce((s2, b) => s2 + (b.cal || 0), 0);
    return {
      cal: a.cal + (m.cal || 0) + bc,
      protein: a.protein + (m.protein || 0) + bp,
      carbs: a.carbs + (m.carbs || 0),
      fat: a.fat + (m.fat || 0),
    };
  }, { cal: 0, protein: 0, carbs: 0, fat: 0 });

  const calDiff = totals.cal - prefs.calorieTarget;
  const protDiff = totals.protein - prefs.proteinTarget;

  return (
    <View style={s.summaryBar}>
      <View style={s.summaryCell}>
        <Text style={s.summaryValue}>{totals.cal}</Text>
        <Text style={s.summaryLabel}>Calories</Text>
        <Text style={s.summaryVsTarget}>
          {calDiff >= 0 ? '+' : ''}{calDiff} vs target
        </Text>
      </View>
      <View style={s.summaryCell}>
        <Text style={[s.summaryValue, { color: '#A8D08D' }]}>{totals.protein}g</Text>
        <Text style={s.summaryLabel}>Protein</Text>
        <Text style={s.summaryVsTarget}>
          {protDiff >= 0 ? '+' : ''}{protDiff}g vs target
        </Text>
      </View>
      <View style={s.summaryCell}>
        <Text style={s.summaryValue}>{totals.carbs}g</Text>
        <Text style={s.summaryLabel}>Carbs</Text>
      </View>
      <View style={s.summaryCell}>
        <Text style={s.summaryValue}>{totals.fat}g</Text>
        <Text style={s.summaryLabel}>Fat</Text>
      </View>
    </View>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function PlanPDF({ planData, prefs, isWeekly }) {
  if (!planData) return null;

  const renderHeader = (dateStr) => (
    <View style={s.header}>
      <Text style={s.brand}>NourishPlan</Text>
      <Text style={s.subtitle}>
        {isWeekly ? 'Weekly Meal Plan' : `Meal Plan — ${formatDate(dateStr)}`}
      </Text>
      <Text style={s.subtitle}>
        Diet: {prefs.dietType || 'Not specified'} · {prefs.numMeals || 4} meals/day
      </Text>
      <View style={s.targetRow}>
        <View style={s.targetBadge}>
          <Text style={s.targetLabel}>Target:</Text>
          <Text style={s.targetValue}>{prefs.calorieTarget} cal</Text>
        </View>
        <View style={s.targetBadge}>
          <Text style={s.targetLabel}>Protein:</Text>
          <Text style={s.targetValue}>{prefs.proteinTarget}g</Text>
        </View>
      </View>
    </View>
  );

  const renderFooter = () => (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Generated by NourishPlan</Text>
      <Text style={s.footerText}>{new Date().toLocaleDateString()}</Text>
    </View>
  );

  if (isWeekly && planData.days) {
    return (
      <Document>
        {planData.days.map((day, dayIdx) => (
          <Page key={dayIdx} size="A4" style={s.page}>
            {dayIdx === 0 && renderHeader()}
            <View style={s.dayHeader}>
              <Text style={s.dayHeaderText}>{DAY_NAMES[dayIdx]}</Text>
            </View>
            {(day.meals || []).map((meal, mIdx) => (
              <MealCardView key={mIdx} meal={meal} />
            ))}
            <DaySummaryView meals={day.meals} prefs={prefs} />
            {renderFooter()}
          </Page>
        ))}
      </Document>
    );
  }

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {renderHeader(planData.date)}
        {(planData.meals || []).map((meal, i) => (
          <MealCardView key={i} meal={meal} />
        ))}
        <DaySummaryView meals={planData.meals} prefs={prefs} />
        {renderFooter()}
      </Page>
    </Document>
  );
}
