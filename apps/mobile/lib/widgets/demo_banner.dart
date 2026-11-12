import 'package:flutter/material.dart';

import '../theme/app_theme.dart';

/// Shown on every screen so the app can never be mistaken for an official service.
class DemoBanner extends StatelessWidget {
  const DemoBanner({super.key});

  static const text = 'DEMONSTRATION · Not affiliated with INEC · Synthetic data';

  @override
  Widget build(BuildContext context) {
    return Semantics(
      container: true,
      label: text,
      child: Container(
        width: double.infinity,
        color: AppColors.charcoal,
        padding: const EdgeInsets.symmetric(vertical: 6, horizontal: 12),
        child: const ExcludeSemantics(
          child: Text(
            text,
            textAlign: TextAlign.center,
            style: TextStyle(color: Color(0xFFFFD77A), fontSize: 12, fontWeight: FontWeight.w700),
          ),
        ),
      ),
    );
  }
}
