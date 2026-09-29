import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  BorderRadius,
  MaxContentWidth,
  Palette,
  Spacing,
} from "@/constants/theme";
import {
  DailyPoint,
  PeriodType,
  useEstadisticasViewModel,
} from "@/features/statistics";

export default function EstadisticasScreen() {
  const { width: windowWidth } = useWindowDimensions();
  const isMobile = windowWidth < 680;

  const {
    period,
    selectPeriod,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    showCustomRangeInput,
    setShowCustomRangeInput,
    applyCustomRange,
    data,
    loading,
    refreshing,
    error,
    onRefresh,
    selectedDay,
    setSelectedDay,
    formatCurrency,
  } = useEstadisticasViewModel();

  const [inputStart, setInputStart] = useState("");
  const [inputEnd, setInputEnd] = useState("");

  const periodOptions: { key: PeriodType; label: string; icon: string }[] = [
    { key: "today", label: "Hoy", icon: "sunny-outline" },
    { key: "week", label: "Esta semana", icon: "calendar-outline" },
    { key: "month", label: "Este mes", icon: "calendar" },
    { key: "previous_month", label: "Mes anterior", icon: "time-outline" },
    { key: "custom", label: "Personalizado", icon: "options-outline" },
  ];

  const handleApplyCustom = () => {
    if (inputStart.trim() && inputEnd.trim()) {
      applyCustomRange(inputStart.trim(), inputEnd.trim());
    }
  };

  // Encontrar el valor máximo de reservas para calcular la altura de las barras
  const maxDayTotal = data?.dailyReservations?.reduce(
    (max, d) => Math.max(max, d.total),
    0
  ) || 1;

  // Encontrar el valor máximo de reservas de un servicio para la barra de progreso
  const maxServiceBookings = data?.popularServices?.reduce(
    (max, s) => Math.max(max, s.totalBookings),
    0
  ) || 1;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: "Estadísticas",
          headerShown: true,
          headerStyle: { backgroundColor: Palette.background },
          headerTintColor: Palette.textPrimary,
          headerShadowVisible: false,
        }}
      />

      <SafeAreaView edges={["bottom"]} style={styles.safeArea}>
        {/* Barra superior fija (Sticky Header): Header compacto + Selector de período */}
        <View style={styles.stickyHeader}>
          <View style={styles.stickyHeaderTopRow}>
            <View style={styles.stickyTitleWrap}>
              <ThemedText style={styles.screenTitle}>
                Estadísticas
              </ThemedText>
              {!isMobile && (
                <ThemedText style={styles.screenSubtitle}>
                  Métricas comerciales, volumen de turnos y recaudación
                </ThemedText>
              )}
            </View>

            {data && (
              <View style={styles.dateRangeBadge}>
                <Ionicons
                  name="calendar-outline"
                  size={13}
                  color={Palette.secondaryLight}
                />
                <ThemedText style={styles.dateRangeBadgeText} numberOfLines={1}>
                  {data.currentRange.formattedRange}
                </ThemedText>
              </View>
            )}
          </View>

          {/* Selector de Período Horizontal Fijo */}
          <View style={styles.periodSelectorWrapper}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.periodTabs}
            >
              {periodOptions.map((opt) => {
                const isActive = period === opt.key;
                return (
                  <Pressable
                    key={opt.key}
                    onPress={() => {
                      if (opt.key === "custom" && !inputStart && data) {
                        setInputStart(data.currentRange.startDate);
                        setInputEnd(data.currentRange.endDate);
                      }
                      selectPeriod(opt.key);
                    }}
                    style={({ pressed }) => [
                      styles.periodTab,
                      isActive && styles.periodTabActive,
                      pressed && styles.pressed,
                    ]}
                  >
                    <Ionicons
                      name={opt.icon as any}
                      size={15}
                      color={isActive ? Palette.primaryLight : Palette.textMuted}
                    />
                    <ThemedText
                      style={[
                        styles.periodTabText,
                        isActive && styles.periodTabTextActive,
                      ]}
                    >
                      {opt.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>

          {/* Formulario de Rango Personalizado */}
          {showCustomRangeInput && (
            <View style={styles.customRangeBox}>
              <View style={styles.customRangeHeader}>
                <Ionicons
                  name="funnel-outline"
                  size={16}
                  color={Palette.primaryLight}
                />
                <ThemedText style={styles.customRangeTitle}>
                  Seleccionar Rango de Fechas
                </ThemedText>
              </View>

              <View style={styles.customRangeRow}>
                <View style={styles.customInputGroup}>
                  <ThemedText style={styles.customInputLabel}>Desde</ThemedText>
                  <TextInput
                    style={styles.customInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Palette.textMuted}
                    value={inputStart}
                    onChangeText={setInputStart}
                    maxLength={10}
                  />
                </View>

                <View style={styles.customInputGroup}>
                  <ThemedText style={styles.customInputLabel}>Hasta</ThemedText>
                  <TextInput
                    style={styles.customInput}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Palette.textMuted}
                    value={inputEnd}
                    onChangeText={setInputEnd}
                    maxLength={10}
                  />
                </View>

                <Pressable
                  style={({ pressed }) => [
                    styles.applyButton,
                    pressed && styles.pressed,
                  ]}
                  onPress={handleApplyCustom}
                >
                  <Ionicons name="checkmark" size={16} color="#ffffff" />
                  <ThemedText style={styles.applyButtonText}>Filtrar</ThemedText>
                </Pressable>
              </View>
            </View>
          )}
        </View>

        {/* Contenido scrolleable debajo de la barra fija */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={Palette.primary}
              colors={[Palette.primary, Palette.secondary]}
            />
          }
        >
          {/* Estado de Carga */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={Palette.primary} />
              <ThemedText style={styles.loadingText}>
                Calculando estadísticas del período...
              </ThemedText>
            </View>
          )}

          {/* Error */}
          {error && !loading && (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={22}
                color={Palette.error}
              />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          {/* Datos y Gráficos */}
          {!loading && data && (
            <View style={styles.mainContent}>
              {/* Sección: 6 Indicadores Principales */}
              <View style={styles.sectionHeader}>
                <ThemedText style={styles.sectionTitle}>
                  Indicadores Principales
                </ThemedText>
                <ThemedText style={styles.sectionSubtitle}>
                  Resumen global del rendimiento en el período seleccionado
                </ThemedText>
              </View>

              <View style={styles.kpiGrid}>
                {/* 1. Reservas */}
                <View style={[styles.kpiCard, isMobile ? styles.kpiCardMobile : styles.kpiCardDesktop, styles.kpiCardHighlight]}>
                  <View style={styles.kpiTopRow}>
                    <View
                      style={[
                        styles.kpiIconWrap,
                        { backgroundColor: "rgba(138, 79, 255, 0.15)" },
                      ]}
                    >
                      <Ionicons
                        name="calendar"
                        size={20}
                        color={Palette.primaryLight}
                      />
                    </View>
                    <ThemedText style={styles.kpiLabel}>Reservas</ThemedText>
                  </View>
                  <ThemedText style={styles.kpiValue}>
                    {data.metrics.totalReservations.current}
                  </ThemedText>
                  <ThemedText style={styles.kpiDescription}>
                    Total de reservas del período
                  </ThemedText>
                  {/* Badge Comparativo */}
                  <View
                    style={[
                      styles.comparisonBadge,
                      data.metrics.totalReservations.direction === "up" &&
                      styles.comparisonBadgeUp,
                      data.metrics.totalReservations.direction === "down" &&
                      styles.comparisonBadgeDown,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.comparisonBadgeText,
                        data.metrics.totalReservations.direction === "up" &&
                        styles.comparisonTextUp,
                        data.metrics.totalReservations.direction === "down" &&
                        styles.comparisonTextDown,
                      ]}
                    >
                      {data.metrics.totalReservations.comparisonText}
                    </ThemedText>
                  </View>
                </View>

                {/* 2. Ingresos Estimados */}
                <View
                  style={[
                    styles.kpiCard,
                    isMobile ? styles.kpiCardMobile : styles.kpiCardDesktop,
                    styles.kpiCardHighlight,
                    styles.kpiCardRevenue,
                  ]}
                >
                  <View style={styles.kpiTopRow}>
                    <View
                      style={[
                        styles.kpiIconWrap,
                        { backgroundColor: "rgba(5, 150, 105, 0.15)" },
                      ]}
                    >
                      <Ionicons
                        name="cash"
                        size={20}
                        color={Palette.successLight}
                      />
                    </View>
                    <ThemedText style={styles.kpiLabel}>
                      Ingresos Estimados
                    </ThemedText>
                  </View>
                  <ThemedText style={[styles.kpiValue, styles.kpiRevenueValue]}>
                    {formatCurrency(data.metrics.revenue.current)}
                  </ThemedText>
                  <ThemedText style={styles.kpiDescription}>
                    Suma de servicios completados
                  </ThemedText>
                  {/* Badge Comparativo */}
                  <View
                    style={[
                      styles.comparisonBadge,
                      data.metrics.revenue.direction === "up" &&
                      styles.comparisonBadgeUp,
                      data.metrics.revenue.direction === "down" &&
                      styles.comparisonBadgeDown,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.comparisonBadgeText,
                        data.metrics.revenue.direction === "up" &&
                        styles.comparisonTextUp,
                        data.metrics.revenue.direction === "down" &&
                        styles.comparisonTextDown,
                      ]}
                    >
                      {data.metrics.revenue.comparisonText}
                    </ThemedText>
                  </View>
                </View>

                {/* 3. Completadas */}
                <View style={[styles.kpiCard, isMobile ? styles.kpiCardMobile : styles.kpiCardDesktop]}>
                  <View style={styles.kpiTopRow}>
                    <View
                      style={[
                        styles.kpiIconWrap,
                        { backgroundColor: "rgba(5, 150, 105, 0.15)" },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color={Palette.successLight}
                      />
                    </View>
                    <ThemedText style={styles.kpiLabel}>Completadas</ThemedText>
                  </View>
                  <ThemedText style={styles.kpiValue}>
                    {data.metrics.completed.count}
                  </ThemedText>
                  <ThemedText style={styles.kpiDescription}>
                    Turnos efectivamente realizados
                  </ThemedText>
                  <View style={styles.rateBadge}>
                    <ThemedText style={styles.rateBadgeText}>
                      {data.metrics.completed.rate}% efectividad
                    </ThemedText>
                  </View>
                </View>

                {/* 4. Clientes Nuevos */}
                <View style={[styles.kpiCard, isMobile ? styles.kpiCardMobile : styles.kpiCardDesktop]}>
                  <View style={styles.kpiTopRow}>
                    <View
                      style={[
                        styles.kpiIconWrap,
                        { backgroundColor: "rgba(0, 210, 255, 0.15)" },
                      ]}
                    >
                      <Ionicons
                        name="people"
                        size={20}
                        color={Palette.secondaryLight}
                      />
                    </View>
                    <ThemedText style={styles.kpiLabel}>
                      Clientes Nuevos
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.kpiValue}>
                    {data.metrics.newCustomers.current}
                  </ThemedText>
                  <ThemedText style={styles.kpiDescription}>
                    Registrados por primera vez
                  </ThemedText>
                  <View
                    style={[
                      styles.comparisonBadge,
                      data.metrics.newCustomers.direction === "up" &&
                      styles.comparisonBadgeUp,
                      data.metrics.newCustomers.direction === "down" &&
                      styles.comparisonBadgeDown,
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.comparisonBadgeText,
                        data.metrics.newCustomers.direction === "up" &&
                        styles.comparisonTextUp,
                        data.metrics.newCustomers.direction === "down" &&
                        styles.comparisonTextDown,
                      ]}
                    >
                      {data.metrics.newCustomers.comparisonText}
                    </ThemedText>
                  </View>
                </View>

                {/* 5. Canceladas */}
                <View style={[styles.kpiCard, isMobile ? styles.kpiCardMobile : styles.kpiCardDesktop]}>
                  <View style={styles.kpiTopRow}>
                    <View
                      style={[
                        styles.kpiIconWrap,
                        { backgroundColor: "rgba(255, 180, 171, 0.12)" },
                      ]}
                    >
                      <Ionicons
                        name="close-circle"
                        size={20}
                        color={Palette.error}
                      />
                    </View>
                    <ThemedText style={styles.kpiLabel}>Canceladas</ThemedText>
                  </View>
                  <ThemedText style={[styles.kpiValue, { color: Palette.error }]}>
                    {data.metrics.cancelled.count}
                  </ThemedText>
                  <ThemedText style={styles.kpiDescription}>
                    Turnos cancelados
                  </ThemedText>
                  <View style={[styles.rateBadge, styles.rateBadgeError]}>
                    <ThemedText
                      style={[styles.rateBadgeText, { color: Palette.error }]}
                    >
                      {data.metrics.cancelled.rate}% tasa de cancelación
                    </ThemedText>
                  </View>
                </View>

                {/* 6. No Presentado */}
                <View style={[styles.kpiCard, isMobile ? styles.kpiCardMobile : styles.kpiCardDesktop]}>
                  <View style={styles.kpiTopRow}>
                    <View
                      style={[
                        styles.kpiIconWrap,
                        { backgroundColor: "rgba(245, 158, 11, 0.15)" },
                      ]}
                    >
                      <Ionicons
                        name="alert-circle"
                        size={20}
                        color={Palette.warningLight}
                      />
                    </View>
                    <ThemedText style={styles.kpiLabel}>No Presentado</ThemedText>
                  </View>
                  <ThemedText
                    style={[styles.kpiValue, { color: Palette.warningLight }]}
                  >
                    {data.metrics.noShow.count}
                  </ThemedText>
                  <ThemedText style={styles.kpiDescription}>
                    Clientes que no se presentaron
                  </ThemedText>
                  <View style={[styles.rateBadge, styles.rateBadgeWarning]}>
                    <ThemedText
                      style={[
                        styles.rateBadgeText,
                        { color: Palette.warningLight },
                      ]}
                    >
                      {data.metrics.noShow.rate}% no presentados
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Aclaración de Ingresos */}
              <View style={styles.disclaimerCard}>
                <Ionicons
                  name="information-circle-outline"
                  size={18}
                  color={Palette.secondaryLight}
                />
                <View style={styles.disclaimerContent}>
                  <ThemedText style={styles.disclaimerTitle}>
                    Cálculo de Ingresos
                  </ThemedText>
                  <ThemedText style={styles.disclaimerText}>
                    {data.revenueDisclaimer} Los turnos cancelados o no
                    presentados no se contabilizan como dinero generado.
                  </ThemedText>
                </View>
              </View>

              {/* Resumen Comparativo Detallado */}
              <View style={styles.comparisonBox}>
                <View style={styles.comparisonHeader}>
                  <Ionicons
                    name="trending-up-outline"
                    size={20}
                    color={Palette.primaryLight}
                  />
                  <View>
                    <ThemedText style={styles.comparisonTitle}>
                      Comparación con {data.previousRange.label}
                    </ThemedText>
                    <ThemedText style={styles.comparisonSubtitle}>
                      {data.currentRange.label} vs. {data.previousRange.label} (
                      {data.previousRange.formattedRange})
                    </ThemedText>
                  </View>
                </View>

                <View style={styles.comparisonRow}>
                  {/* Reservas */}
                  <View style={styles.comparisonItem}>
                    <ThemedText style={styles.comparisonItemLabel}>
                      Reservas
                    </ThemedText>
                    <View style={styles.comparisonNumbers}>
                      <ThemedText style={styles.comparisonCurrentNumber}>
                        {data.metrics.totalReservations.current}
                      </ThemedText>
                      <ThemedText style={styles.comparisonPrevNumber}>
                        vs {data.metrics.totalReservations.previous}
                      </ThemedText>
                    </View>
                    <ThemedText
                      style={[
                        styles.comparisonItemBadge,
                        data.metrics.totalReservations.direction === "up" &&
                        styles.comparisonTextUp,
                        data.metrics.totalReservations.direction === "down" &&
                        styles.comparisonTextDown,
                      ]}
                    >
                      {data.metrics.totalReservations.comparisonText}
                    </ThemedText>
                  </View>

                  <View style={styles.comparisonDivider} />

                  {/* Ingresos */}
                  <View style={styles.comparisonItem}>
                    <ThemedText style={styles.comparisonItemLabel}>
                      Ingresos
                    </ThemedText>
                    <View style={styles.comparisonNumbers}>
                      <ThemedText style={styles.comparisonCurrentNumber}>
                        {formatCurrency(data.metrics.revenue.current)}
                      </ThemedText>
                      <ThemedText style={styles.comparisonPrevNumber}>
                        vs {formatCurrency(data.metrics.revenue.previous)}
                      </ThemedText>
                    </View>
                    <ThemedText
                      style={[
                        styles.comparisonItemBadge,
                        data.metrics.revenue.direction === "up" &&
                        styles.comparisonTextUp,
                        data.metrics.revenue.direction === "down" &&
                        styles.comparisonTextDown,
                      ]}
                    >
                      {data.metrics.revenue.comparisonText}
                    </ThemedText>
                  </View>

                  <View style={styles.comparisonDivider} />

                  {/* Clientes */}
                  <View style={styles.comparisonItem}>
                    <ThemedText style={styles.comparisonItemLabel}>
                      Clientes nuevos
                    </ThemedText>
                    <View style={styles.comparisonNumbers}>
                      <ThemedText style={styles.comparisonCurrentNumber}>
                        {data.metrics.newCustomers.current}
                      </ThemedText>
                      <ThemedText style={styles.comparisonPrevNumber}>
                        vs {data.metrics.newCustomers.previous}
                      </ThemedText>
                    </View>
                    <ThemedText
                      style={[
                        styles.comparisonItemBadge,
                        data.metrics.newCustomers.direction === "up" &&
                        styles.comparisonTextUp,
                        data.metrics.newCustomers.direction === "down" &&
                        styles.comparisonTextDown,
                      ]}
                    >
                      {data.metrics.newCustomers.comparisonText}
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* GRÁFICO 1: 📈 Reservas por día */}
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View style={styles.chartHeaderTitleWrap}>
                    <ThemedText style={styles.chartTitle}>
                      📈 Reservas por día
                    </ThemedText>
                    <ThemedText style={styles.chartSubtitle}>
                      Detecta tus días de mayor actividad y flujo de clientes
                    </ThemedText>
                  </View>
                </View>

                {/* Callout de Día Pico */}
                {data.peakDayInfo && (
                  <View style={styles.peakCallout}>
                    <Ionicons name="flame" size={18} color="#f59e0b" />
                    <ThemedText style={styles.peakCalloutText}>
                      {data.peakDayInfo.insight}
                    </ThemedText>
                  </View>
                )}

                {/* Barras Interactivas */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.barChartScroll}
                >
                  {data.dailyReservations.map((d: DailyPoint) => {
                    const isSelected = selectedDay?.date === d.date;
                    // Altura mínima 8px para que los días con 0 reservas se vean en el eje
                    const barHeight =
                      d.total > 0
                        ? Math.max(16, (d.total / maxDayTotal) * 130)
                        : 6;

                    return (
                      <Pressable
                        key={d.date}
                        onPress={() => setSelectedDay(d)}
                        style={({ pressed }) => [
                          styles.barColumn,
                          pressed && styles.pressed,
                        ]}
                      >
                        {/* Indicador de valor arriba de la barra */}
                        <ThemedText
                          style={[
                            styles.barValueText,
                            d.isPeak && styles.barValuePeak,
                            isSelected && styles.barValueSelected,
                          ]}
                        >
                          {d.total > 0 ? d.total : "–"}
                        </ThemedText>

                        {/* Contenedor del pilar */}
                        <View style={styles.barSlot}>
                          <View
                            style={[
                              styles.barFill,
                              { height: barHeight },
                              d.total === 0 && styles.barFillZero,
                              d.isPeak && styles.barFillPeak,
                              isSelected && styles.barFillSelected,
                            ]}
                          />
                        </View>

                        {/* Etiqueta del día */}
                        <ThemedText
                          style={[
                            styles.barLabel,
                            d.isPeak && styles.barLabelPeak,
                            isSelected && styles.barLabelSelected,
                          ]}
                          numberOfLines={1}
                        >
                          {d.dayLabel}
                        </ThemedText>

                        {/* Icono pico */}
                        {d.isPeak && (
                          <View style={styles.peakDot}>
                            <Ionicons name="flame" size={10} color="#f59e0b" />
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </ScrollView>

                {/* Leyenda y Detalle del Día Seleccionado */}
                {selectedDay && (
                  <View style={styles.dayDetailBox}>
                    <View style={styles.dayDetailHeader}>
                      <View style={styles.dayDetailHeaderLeft}>
                        <Ionicons
                          name="calendar"
                          size={16}
                          color={Palette.primaryLight}
                        />
                        <ThemedText style={styles.dayDetailTitle}>
                          {selectedDay.fullDayName} {selectedDay.date}
                        </ThemedText>
                        {selectedDay.isPeak && (
                          <View style={styles.peakTag}>
                            <ThemedText style={styles.peakTagText}>
                              🔥 Pico de Actividad
                            </ThemedText>
                          </View>
                        )}
                      </View>
                    </View>

                    <View style={styles.dayDetailMetrics}>
                      <View style={styles.dayMetricCol}>
                        <ThemedText style={styles.dayMetricNumber}>
                          {selectedDay.total}
                        </ThemedText>
                        <ThemedText style={styles.dayMetricLabel}>
                          Reservas
                        </ThemedText>
                      </View>
                      <View style={styles.dayMetricCol}>
                        <ThemedText
                          style={[
                            styles.dayMetricNumber,
                            { color: Palette.successLight },
                          ]}
                        >
                          {selectedDay.completed}
                        </ThemedText>
                        <ThemedText style={styles.dayMetricLabel}>
                          Completadas
                        </ThemedText>
                      </View>
                      <View style={styles.dayMetricCol}>
                        <ThemedText
                          style={[
                            styles.dayMetricNumber,
                            { color: Palette.error },
                          ]}
                        >
                          {selectedDay.cancelled}
                        </ThemedText>
                        <ThemedText style={styles.dayMetricLabel}>
                          Canceladas
                        </ThemedText>
                      </View>
                      <View style={styles.dayMetricCol}>
                        <ThemedText
                          style={[
                            styles.dayMetricNumber,
                            { color: Palette.warningLight },
                          ]}
                        >
                          {selectedDay.noShow}
                        </ThemedText>
                        <ThemedText style={styles.dayMetricLabel}>
                          No Presentado
                        </ThemedText>
                      </View>
                      <View style={styles.dayMetricCol}>
                        <ThemedText
                          style={[
                            styles.dayMetricNumber,
                            { color: Palette.primaryLight },
                          ]}
                        >
                          {formatCurrency(selectedDay.revenue)}
                        </ThemedText>
                        <ThemedText style={styles.dayMetricLabel}>
                          Ingresos
                        </ThemedText>
                      </View>
                    </View>
                  </View>
                )}
              </View>

              {/* GRÁFICO 2: ✂️ Servicios más solicitados */}
              <View style={styles.chartCard}>
                <View style={styles.chartHeader}>
                  <View style={styles.chartHeaderTitleWrap}>
                    <ThemedText style={styles.chartTitle}>
                      ✂️ Servicios más solicitados
                    </ThemedText>
                    <ThemedText style={styles.chartSubtitle}>
                      Ranking de cortes y servicios con mayor demanda y facturación
                    </ThemedText>
                  </View>
                </View>

                {data.popularServices.length === 0 ? (
                  <View style={styles.emptyServices}>
                    <Ionicons
                      name="cut-outline"
                      size={32}
                      color={Palette.textMuted}
                    />
                    <ThemedText style={styles.emptyServicesText}>
                      No se registraron servicios completados o reservados en este
                      período.
                    </ThemedText>
                  </View>
                ) : (
                  <View style={styles.servicesList}>
                    {data.popularServices.map((svc, index) => {
                      const isTop1 = index === 0;
                      const isTop2 = index === 1;
                      const isTop3 = index === 2;

                      const progressPercent = Math.min(
                        100,
                        Math.round((svc.totalBookings / maxServiceBookings) * 100)
                      );

                      return (
                        <View key={svc.id} style={styles.serviceItem}>
                          {/* Fila Superior: Posición + Nombre + Recaudación */}
                          <View style={styles.serviceRowTop}>
                            <View style={styles.serviceRankAndName}>
                              <View
                                style={[
                                  styles.rankBadge,
                                  isTop1 && styles.rankBadge1,
                                  isTop2 && styles.rankBadge2,
                                  isTop3 && styles.rankBadge3,
                                ]}
                              >
                                <ThemedText
                                  style={[
                                    styles.rankBadgeText,
                                    (isTop1 || isTop2 || isTop3) &&
                                    styles.rankBadgeTextTop,
                                  ]}
                                >
                                  #{index + 1}
                                </ThemedText>
                              </View>

                              <View>
                                <ThemedText style={styles.serviceName}>
                                  {svc.name}
                                </ThemedText>
                                <ThemedText style={styles.serviceMeta}>
                                  {svc.durationMinutes} min • {formatCurrency(svc.price)}
                                </ThemedText>
                              </View>
                            </View>

                            <View style={styles.serviceRevenueWrap}>
                              <ThemedText style={styles.serviceRevenueText}>
                                {formatCurrency(svc.totalRevenue)}
                              </ThemedText>
                              <ThemedText style={styles.serviceRevenueSub}>
                                facturado
                              </ThemedText>
                            </View>
                          </View>

                          {/* Barra de Progreso Visual */}
                          <View style={styles.progressBarTrack}>
                            <View
                              style={[
                                styles.progressBarFill,
                                { width: `${progressPercent}%` },
                                isTop1 && styles.progressBarFillTop1,
                              ]}
                            />
                          </View>

                          {/* Estadísticas de Reservas y Porcentaje */}
                          <View style={styles.serviceStatsFooter}>
                            <ThemedText style={styles.serviceStatsText}>
                              <ThemedText style={styles.serviceStatsHighlight}>
                                {svc.totalBookings}
                              </ThemedText>{" "}
                              {svc.totalBookings === 1 ? "reserva" : "reservas"} (
                              {svc.percentage}% de la agenda)
                            </ThemedText>

                            <ThemedText style={styles.serviceStatsCompleted}>
                              ✅ {svc.completedBookings} completadas
                            </ThemedText>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                )}
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.background,
  },
  safeArea: {
    flex: 1,
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.four,
    gap: Spacing.four,
    paddingBottom: Spacing.six,
  },
  stickyHeader: {
    backgroundColor: Palette.background,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
    borderBottomWidth: 1,
    borderBottomColor: Palette.borderSubtle,
    zIndex: 10,
  },
  stickyHeaderTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: Spacing.two,
  },
  stickyTitleWrap: {
    gap: 2,
    flex: 1,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: Palette.textPrimary,
  },
  screenSubtitle: {
    fontSize: 12,
    color: Palette.textMuted,
    lineHeight: 16,
  },
  dateRangeBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Palette.surfaceContainerHigh,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.pill,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    maxWidth: "58%",
  },
  dateRangeBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: Palette.secondaryLight,
  },
  periodSelectorWrapper: {
    marginHorizontal: -Spacing.four,
  },
  periodTabs: {
    paddingHorizontal: Spacing.four,
    gap: Spacing.two,
  },
  periodTab: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.pill,
    backgroundColor: Palette.surfaceContainer,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  periodTabActive: {
    backgroundColor: Palette.primaryDark,
    borderColor: Palette.primaryDim,
  },
  periodTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.textMuted,
  },
  periodTabTextActive: {
    color: Palette.primaryLight,
    fontWeight: "700",
  },
  customRangeBox: {
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.card,
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: Palette.primaryDim,
  },
  customRangeHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  customRangeTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.primaryLight,
  },
  customRangeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: Spacing.two,
  },
  customInputGroup: {
    flex: 1,
    gap: 4,
  },
  customInputLabel: {
    fontSize: 11,
    color: Palette.textMuted,
    fontWeight: "600",
  },
  customInput: {
    backgroundColor: Palette.surfaceContainerHigh,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 13,
    color: Palette.textPrimary,
  },
  applyButton: {
    backgroundColor: Palette.primary,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    justifyContent: "center",
  },
  applyButtonText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#ffffff",
  },
  loadingContainer: {
    paddingVertical: Spacing.six,
    alignItems: "center",
    gap: Spacing.three,
  },
  loadingText: {
    fontSize: 14,
    color: Palette.textMuted,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.two,
    backgroundColor: Palette.errorContainer,
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
  },
  errorText: {
    fontSize: 13,
    color: Palette.error,
    flex: 1,
  },
  mainContent: {
    gap: Spacing.four,
  },
  sectionHeader: {
    gap: 2,
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Palette.textMuted,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: Spacing.three,
    width: "100%",
  },
  kpiCard: {
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.card,
    padding: Spacing.four,
    gap: 6,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  kpiCardMobile: {
    width: "100%",
  },
  kpiCardDesktop: {
    width: "48%",
  },
  kpiCardHighlight: {
    backgroundColor: Palette.surfaceContainerHigh,
    borderColor: Palette.border,
  },
  kpiCardRevenue: {
    borderColor: "rgba(5, 150, 105, 0.4)",
  },
  kpiTopRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  kpiIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  kpiLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: Palette.textPrimary,
    flex: 1,
  },
  kpiValue: {
    fontSize: 26,
    fontWeight: "800",
    color: Palette.textPrimary,
    marginVertical: 2,
  },
  kpiRevenueValue: {
    color: Palette.successLight,
    fontSize: 24,
  },
  kpiDescription: {
    fontSize: 11,
    color: Palette.textMuted,
    lineHeight: 15,
  },
  comparisonBadge: {
    alignSelf: "flex-start",
    backgroundColor: Palette.surfaceContainerLowest,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.pill,
    marginTop: 4,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  comparisonBadgeUp: {
    backgroundColor: "rgba(5, 150, 105, 0.15)",
    borderColor: "rgba(5, 150, 105, 0.3)",
  },
  comparisonBadgeDown: {
    backgroundColor: "rgba(255, 180, 171, 0.12)",
    borderColor: "rgba(255, 180, 171, 0.25)",
  },
  comparisonBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.textMuted,
  },
  comparisonTextUp: {
    color: Palette.successLight,
  },
  comparisonTextDown: {
    color: Palette.error,
  },
  rateBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(5, 150, 105, 0.15)",
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.pill,
    marginTop: 4,
  },
  rateBadgeError: {
    backgroundColor: "rgba(255, 180, 171, 0.12)",
  },
  rateBadgeWarning: {
    backgroundColor: "rgba(245, 158, 11, 0.15)",
  },
  rateBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: Palette.successLight,
  },
  disclaimerCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    backgroundColor: "rgba(0, 210, 255, 0.08)",
    padding: Spacing.three,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: "rgba(0, 210, 255, 0.2)",
  },
  disclaimerContent: {
    flex: 1,
    gap: 2,
  },
  disclaimerTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: Palette.secondaryLight,
  },
  disclaimerText: {
    fontSize: 12,
    color: Palette.textMuted,
    lineHeight: 17,
  },
  comparisonBox: {
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.card,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  comparisonHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  comparisonSubtitle: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  comparisonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingTop: Spacing.two,
  },
  comparisonItem: {
    flex: 1,
    gap: 4,
  },
  comparisonDivider: {
    width: 1,
    backgroundColor: Palette.borderSubtle,
    height: "100%",
    marginHorizontal: Spacing.two,
  },
  comparisonItemLabel: {
    fontSize: 12,
    color: Palette.textMuted,
    fontWeight: "600",
  },
  comparisonNumbers: {
    gap: 1,
  },
  comparisonCurrentNumber: {
    fontSize: 18,
    fontWeight: "800",
    color: Palette.textPrimary,
  },
  comparisonPrevNumber: {
    fontSize: 11,
    color: Palette.textMuted,
  },
  comparisonItemBadge: {
    fontSize: 11,
    fontWeight: "700",
    color: Palette.textMuted,
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: Palette.surfaceContainer,
    borderRadius: BorderRadius.card,
    padding: Spacing.four,
    gap: Spacing.three,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  chartHeaderTitleWrap: {
    gap: 2,
  },
  chartTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  chartSubtitle: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  peakCallout: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(245, 158, 11, 0.12)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: "rgba(245, 158, 11, 0.3)",
  },
  peakCalloutText: {
    fontSize: 13,
    fontWeight: "600",
    color: Palette.warningLight,
  },
  barChartScroll: {
    paddingVertical: Spacing.two,
    alignItems: "flex-end",
    gap: 12,
    minHeight: 190,
  },
  barColumn: {
    alignItems: "center",
    width: 38,
    justifyContent: "flex-end",
    gap: 6,
  },
  barValueText: {
    fontSize: 11,
    fontWeight: "600",
    color: Palette.textMuted,
  },
  barValuePeak: {
    color: Palette.warningLight,
    fontWeight: "800",
  },
  barValueSelected: {
    color: Palette.secondaryLight,
    fontWeight: "800",
  },
  barSlot: {
    height: 130,
    width: 22,
    backgroundColor: Palette.surfaceContainerHigh,
    borderRadius: BorderRadius.pill,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  barFill: {
    width: "100%",
    backgroundColor: Palette.primary,
    borderRadius: BorderRadius.pill,
  },
  barFillZero: {
    backgroundColor: "transparent",
  },
  barFillPeak: {
    backgroundColor: Palette.secondary,
  },
  barFillSelected: {
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  barLabel: {
    fontSize: 11,
    color: Palette.textMuted,
    fontWeight: "600",
  },
  barLabelPeak: {
    color: Palette.warningLight,
    fontWeight: "700",
  },
  barLabelSelected: {
    color: Palette.secondaryLight,
    fontWeight: "700",
  },
  peakDot: {
    position: "absolute",
    top: -4,
  },
  dayDetailBox: {
    backgroundColor: Palette.surfaceContainerHigh,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    gap: Spacing.two,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  dayDetailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayDetailHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dayDetailTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  peakTag: {
    backgroundColor: "rgba(245, 158, 11, 0.2)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: BorderRadius.pill,
  },
  peakTagText: {
    fontSize: 10,
    fontWeight: "700",
    color: Palette.warningLight,
  },
  dayDetailMetrics: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 4,
  },
  dayMetricCol: {
    alignItems: "center",
    gap: 2,
  },
  dayMetricNumber: {
    fontSize: 16,
    fontWeight: "800",
    color: Palette.textPrimary,
  },
  dayMetricLabel: {
    fontSize: 10,
    color: Palette.textMuted,
    fontWeight: "600",
  },
  emptyServices: {
    paddingVertical: Spacing.five,
    alignItems: "center",
    gap: Spacing.two,
  },
  emptyServicesText: {
    fontSize: 13,
    color: Palette.textMuted,
    textAlign: "center",
  },
  servicesList: {
    gap: Spacing.three,
  },
  serviceItem: {
    backgroundColor: Palette.surfaceContainerHigh,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    gap: 8,
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  serviceRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceRankAndName: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Palette.surfaceContainerLowest,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Palette.borderSubtle,
  },
  rankBadge1: {
    backgroundColor: "#FFD700",
    borderColor: "#E6C200",
  },
  rankBadge2: {
    backgroundColor: "#C0C0C0",
    borderColor: "#A9A9A9",
  },
  rankBadge3: {
    backgroundColor: "#CD7F32",
    borderColor: "#B87326",
  },
  rankBadgeText: {
    fontSize: 11,
    fontWeight: "800",
    color: Palette.textMuted,
  },
  rankBadgeTextTop: {
    color: "#000000",
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "700",
    color: Palette.textPrimary,
  },
  serviceMeta: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  serviceRevenueWrap: {
    alignItems: "flex-end",
  },
  serviceRevenueText: {
    fontSize: 15,
    fontWeight: "800",
    color: Palette.successLight,
  },
  serviceRevenueSub: {
    fontSize: 10,
    color: Palette.textMuted,
  },
  progressBarTrack: {
    height: 6,
    backgroundColor: Palette.surfaceContainerLowest,
    borderRadius: BorderRadius.pill,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: Palette.primary,
    borderRadius: BorderRadius.pill,
  },
  progressBarFillTop1: {
    backgroundColor: Palette.secondary,
  },
  serviceStatsFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceStatsText: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  serviceStatsHighlight: {
    color: Palette.textPrimary,
    fontWeight: "700",
  },
  serviceStatsCompleted: {
    fontSize: 12,
    color: Palette.successLight,
    fontWeight: "600",
  },
  pressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
});
