import 'package:flutter/material.dart';

import '../theme/app_theme.dart';
import 'aso_rock_background.dart';
import 'demo_banner.dart';

/// Shared frame for every module screen: Aso Rock backdrop, demo banner, back button.
class ModuleScaffold extends StatelessWidget {
  const ModuleScaffold({
    super.key,
    required this.title,
    required this.subtitle,
    required this.child,
    this.trailing,
  });

  final String title;
  final String subtitle;
  final Widget child;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AsoRockBackground(
        tint: 0.74,
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const DemoBanner(),
              Padding(
                padding: const EdgeInsets.fromLTRB(8, 8, 16, 4),
                child: Row(
                  children: [
                    IconButton(
                      onPressed: () => Navigator.of(context).maybePop(),
                      icon: const Icon(Icons.arrow_back),
                      color: Colors.white,
                      tooltip: 'Back',
                    ),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            title,
                            style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.w800),
                          ),
                          Text(
                            subtitle,
                            style: const TextStyle(color: Color(0xFFB9D6C8), fontSize: 13),
                          ),
                        ],
                      ),
                    ),
                    if (trailing != null) trailing!,
                  ],
                ),
              ),
              Expanded(child: child),
            ],
          ),
        ),
      ),
    );
  }
}

/// White translucent card used across the module screens.
class DemoCard extends StatelessWidget {
  const DemoCard({super.key, required this.child, this.padding = const EdgeInsets.all(16)});

  final Widget child;
  final EdgeInsets padding;

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: padding,
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.95),
        borderRadius: BorderRadius.circular(18),
        boxShadow: const [BoxShadow(color: Color(0x22022C1D), blurRadius: 18, offset: Offset(0, 8))],
      ),
      child: child,
    );
  }
}

/// Small pill used for statuses and categories.
class StatusPill extends StatelessWidget {
  const StatusPill({super.key, required this.label, this.background, this.foreground});

  final String label;
  final Color? background;
  final Color? foreground;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: background ?? AppColors.mint,
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        label,
        style: TextStyle(color: foreground ?? AppColors.emerald, fontSize: 12, fontWeight: FontWeight.w700),
      ),
    );
  }
}
