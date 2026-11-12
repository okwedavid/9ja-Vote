import 'package:flutter/material.dart';

/// Mirrors packages/design-system/tokens.json.
class AppColors {
  static const green = Color(0xFF008751);
  static const emerald = Color(0xFF04492F);
  static const emerald900 = Color(0xFF022C1D);
  static const mint = Color(0xFFE8F5EE);
  static const charcoal = Color(0xFF18211D);
  static const gold = Color(0xFFC8961E);
}

class AppTheme {
  static ThemeData get light {
    final scheme = ColorScheme.fromSeed(
      seedColor: AppColors.green,
      primary: AppColors.green,
      secondary: AppColors.emerald,
      surface: Colors.white,
    );
    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: AppColors.mint,
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          minimumSize: const Size.fromHeight(56), // large, accessible touch target
          shape: const StadiumBorder(),
          textStyle: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
        ),
      ),
    );
  }
}
