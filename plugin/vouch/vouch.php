<?php
/*
Plugin Name: Vouch Plugin
Description: A plugin that integrates with Social Baking's Vouch.
Version: 1.0.0
Author: Fabian Cook
Author URI: https://github.com/socialbaking/vouch
License: MIT
*/

// Exit if accessed directly.
if (!defined('ABSPATH')) {
    exit;
}

require_once 'client.php';

function vouch_plugin_settings_init() {
    add_settings_section(
        'vouch_plugin_settings_section',
        'Vouch API Settings',
        '',
        'vouch_plugin'
    );

    add_settings_field(
        'vouch_plugin_setting_access_token',
        'Access Token',
        'vouch_plugin_setting_access_token_callback',
        'vouch_plugin',
        'vouch_plugin_settings_section'
    );
    register_setting('vouch_plugin', 'vouch_plugin_setting_access_token');

    add_settings_field(
        'vouch_plugin_setting_url',
        'URL',
        'vouch_plugin_setting_url_callback',
        'vouch_plugin',
        'vouch_plugin_settings_section'
    );
    register_setting('vouch_plugin', 'vouch_plugin_setting_url');

    add_settings_field(
        'vouch_plugin_setting_version',
        'Version',
        'vouch_plugin_setting_version_callback',
        'vouch_plugin',
        'vouch_plugin_settings_section'
    );
    register_setting('vouch_plugin', 'vouch_plugin_setting_version');

    add_settings_field(
        'vouch_plugin_setting_partner_id',
        'Partner ID',
        'vouch_plugin_setting_partner_id_callback',
        'vouch_plugin',
        'vouch_plugin_settings_section'
    );
    register_setting('vouch_plugin', 'vouch_plugin_setting_partner_id');

}

function vouch_plugin_setting_access_token_callback() {
    $value = get_option('vouch_plugin_setting_access_token', '');
    echo '<input type="text" name="vouch_plugin_setting_access_token" value="' . esc_attr($value) . '" />';
}

function vouch_plugin_setting_url_callback() {
    $value = get_option('vouch_plugin_setting_url', '');
    echo '<input type="text" name="vouch_plugin_setting_url" value="' . esc_attr($value) . '" />';
}

function vouch_plugin_setting_version_callback() {
    $value = get_option('vouch_plugin_setting_version', '');
    echo '<input type="text" name="vouch_plugin_setting_version" value="' . esc_attr($value) . '" />';
}

function vouch_plugin_setting_partner_id_callback() {
$value = get_option('vouch_plugin_setting_partner_id', '');
echo '<input type="text" name="vouch_plugin_setting_partner_id" value="' . esc_attr($value) . '" />';
}

function vouch_plugin_init() {
add_options_page(
'Vouch API Settings',
'Vouch API',
'manage_options',
'vouch_plugin',
'vouch_plugin_settings_page'
);
}

function vouch_plugin_settings_page() {
?>
<div class="wrap">
<h1>Vouch API Settings</h1>
<form method="post" action="options.php">
<?php
         settings_fields('vouch_plugin');
         do_settings_sections('vouch_plugin');
         submit_button();
         ?>
</form>
</div>
<?php
}

add_action('admin_init', 'vouch_plugin_settings_init');
add_action('admin_menu', 'vouch_plugin_init');

function vouch_plugin_client() {
    $accessToken = get_option('vouch_plugin_setting_access_token');
    $url = get_option('vouch_plugin_setting_url');
    $version = intval(get_option('vouch_plugin_setting_version'));
    $partnerId = get_option('vouch_plugin_setting_partner_id');

    $options = [
        'accessToken' => $accessToken,
        'url' => $url,
        'version' => $version,
        'partnerId' => $partnerId,
    ];
    return new Client($options);
}

// Add Vouch Unique Code field to the coupon edit page
function vouch_add_coupon_unique_code_field() {
    woocommerce_wp_text_input([
        'id' => 'vouch_unique_code',
        'label' => __('Vouch Unique Code', 'vouch-plugin'),
        'description' => __('Enter the Vouch Unique Code associated with this coupon.', 'vouch-plugin'),
        'desc_tip' => true,
        'type' => 'text',
    ]);
}
add_action('woocommerce_coupon_options', 'vouch_add_coupon_unique_code_field');

// Save Vouch Unique Code field value when coupon is saved
function vouch_save_coupon_unique_code_field($post_id) {
    $vouch_unique_code = isset($_POST['vouch_unique_code']) ? sanitize_text_field($_POST['vouch_unique_code']) : '';
    update_post_meta($post_id, 'vouch_unique_code', $vouch_unique_code);
}
add_action('woocommerce_coupon_options_save', 'vouch_save_coupon_unique_code_field');

// Apply Vouch unique code logic when coupon is loaded
function vouch_apply_coupon_unique_code_logic($coupon) {
    $vouch_unique_code = get_post_meta($coupon->get_id(), 'vouch_unique_code', true);

    if (!empty($vouch_unique_code)) {
        $client = vouch_plugin_client();
        $verified = $client->verifyUniqueCode($vouch_unique_code);

        if (!$verified) {
            // Set the coupon as invalid if the Vouch unique code is not verified
            $coupon->set_virtual(false);
            $coupon->add_coupon_message(WC_Coupon::E_WC_COUPON_INVALID_REMOVED);
        }
    }
}
add_action('woocommerce_coupon_loaded', 'vouch_apply_coupon_unique_code_logic');